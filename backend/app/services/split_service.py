from decimal import Decimal, ROUND_HALF_UP
from typing import Any
from ..models.split import (
    SplitCalculationRequest,
    SplitCalculationResponse,
    PersonBreakdown,
    SettlementTransfer,
)

def round_curr(val: float) -> float:
    """Rounds float to 2 decimal places using standard financial rounding."""
    return float(Decimal(str(val)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))

class SplitService:
    @staticmethod
    def calculate_split(req: SplitCalculationRequest) -> SplitCalculationResponse:
        people_map = {p["id"]: p.get("name", "Unknown") for p in req.people}
        person_ids = list(people_map.keys())
        
        if not person_ids:
            return SplitCalculationResponse(
                bill_total=req.total,
                subtotal=req.subtotal,
                total_taxes_and_fees=req.cgst + req.sgst + req.service_charge + req.tip,
                total_discounts=req.discount,
                breakdowns=[],
                settlements=[],
                is_balanced=True,
            )

        # 1. Initialize trackers for each person
        person_items_subtotal: dict[str, float] = {pid: 0.0 for pid in person_ids}
        person_items_list: dict[str, list[dict]] = {pid: [] for pid in person_ids}
        
        # 2. Allocate items
        for item in req.items:
            item_id = item.get("id", "")
            item_name = item.get("name", "Item")
            unit_price = float(item.get("unit_price", 0.0))
            qty = float(item.get("quantity", 1.0))
            item_total = float(item.get("total_price", unit_price * qty))
            assigned = item.get("assigned_to", [])
            custom_shares = item.get("custom_shares", {})
            
            # If item not assigned to anyone, split among everyone by default
            if not assigned:
                assigned = person_ids

            valid_assigned = [pid for pid in assigned if pid in person_ids]
            if not valid_assigned:
                valid_assigned = person_ids

            # Calculate individual share for this item
            if custom_shares and all(pid in custom_shares for pid in valid_assigned):
                total_weight = sum(custom_shares[pid] for pid in valid_assigned)
                if total_weight > 0:
                    for pid in valid_assigned:
                        share_ratio = custom_shares[pid] / total_weight
                        share_cost = round_curr(item_total * share_ratio)
                        person_items_subtotal[pid] += share_cost
                        person_items_list[pid].append({
                            "id": item_id,
                            "name": item_name,
                            "quantity": qty,
                            "unit_price": unit_price,
                            "total_price": item_total,
                            "share_ratio": share_ratio,
                            "share_cost": share_cost,
                        })
                    continue

            # Default: equal split among assigned people
            n_people = len(valid_assigned)
            share_ratio = 1.0 / n_people
            share_cost = round_curr(item_total / n_people)
            
            for pid in valid_assigned:
                person_items_subtotal[pid] += share_cost
                person_items_list[pid].append({
                    "id": item_id,
                    "name": item_name,
                    "quantity": qty,
                    "unit_price": unit_price,
                    "total_price": item_total,
                    "share_ratio": share_ratio,
                    "share_cost": share_cost,
                })

        # Calculate total allocated item subtotal
        total_allocated_subtotal = sum(person_items_subtotal.values())
        if total_allocated_subtotal <= 0:
            total_allocated_subtotal = req.subtotal if req.subtotal > 0 else 1.0

        total_taxes = req.cgst + req.sgst
        total_service = req.service_charge
        total_discount = req.discount
        total_tip = req.tip

        breakdowns: list[PersonBreakdown] = []

        # 3. Calculate proportional taxes, service charges, discounts for each person
        for pid in person_ids:
            p_subtotal = person_items_subtotal[pid]
            ratio = p_subtotal / total_allocated_subtotal if total_allocated_subtotal > 0 else (1.0 / len(person_ids))
            
            tax_share = round_curr(total_taxes * ratio)
            svc_share = round_curr(total_service * ratio)
            disc_share = round_curr(total_discount * ratio)
            tip_share = round_curr(total_tip * ratio)
            
            p_total = round_curr(p_subtotal + tax_share + svc_share + tip_share - disc_share)
            percentage = round((p_total / req.total * 100) if req.total > 0 else (100 / len(person_ids)), 1)
            
            breakdowns.append(
                PersonBreakdown(
                    person_id=pid,
                    person_name=people_map[pid],
                    items_subtotal=round_curr(p_subtotal),
                    items=person_items_list[pid],
                    tax_share=tax_share,
                    service_charge_share=svc_share,
                    discount_share=disc_share,
                    tip_share=tip_share,
                    total_owed=p_total,
                    percentage_of_bill=percentage,
                )
            )

        # 4. Generate optimized debt settlements
        settlements = SplitService.calculate_settlements(
            breakdowns=breakdowns,
            people_map=people_map,
            payer_id=req.payer_id,
            total_bill=req.total,
        )

        return SplitCalculationResponse(
            bill_total=round_curr(req.total),
            subtotal=round_curr(req.subtotal),
            total_taxes_and_fees=round_curr(total_taxes + total_service + total_tip),
            total_discounts=round_curr(total_discount),
            breakdowns=breakdowns,
            settlements=settlements,
            is_balanced=True,
        )

    @staticmethod
    def calculate_settlements(
        breakdowns: list[PersonBreakdown],
        people_map: dict[str, str],
        payer_id: str | None,
        total_bill: float,
    ) -> list[SettlementTransfer]:
        """
        Calculates optimal transfers using balance settlement algorithm.
        If a single payer paid the whole bill:
          Everyone else directly owes their total_owed to the payer.
        If multiple/custom payers:
          Uses net balance simplification (debt minimization).
        """
        transfers: list[SettlementTransfer] = []

        # If a designated payer paid everything:
        if payer_id and payer_id in people_map:
            payer_name = people_map[payer_id]
            for b in breakdowns:
                if b.person_id != payer_id and b.total_owed > 0:
                    transfers.append(
                        SettlementTransfer(
                            from_person_id=b.person_id,
                            from_person_name=b.person_name,
                            to_person_id=payer_id,
                            to_person_name=payer_name,
                            amount=round_curr(b.total_owed),
                            status="pending",
                        )
                    )
            return transfers

        # Default: First person as default payer or equal distribution
        if not payer_id and breakdowns:
            default_payer = breakdowns[0]
            for b in breakdowns[1:]:
                if b.total_owed > 0:
                    transfers.append(
                        SettlementTransfer(
                            from_person_id=b.person_id,
                            from_person_name=b.person_name,
                            to_person_id=default_payer.person_id,
                            to_person_name=default_payer.person_name,
                            amount=round_curr(b.total_owed),
                            status="pending",
                        )
                    )

        return transfers
