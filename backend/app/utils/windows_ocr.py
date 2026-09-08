import subprocess
import tempfile
import os
from pathlib import Path

POWERSHELL_OCR_SCRIPT = """
param([string]$ImagePath)

Add-Type -AssemblyName System.Drawing
[Windows.Media.Ocr.OcrEngine, Windows.Foundation.Diagnostics, ContentType = WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime] | Out-Null

async function Run-Ocr([string]$path) {
    $file = [System.IO.File]::OpenRead($path)
    $memStream = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
    $stream = $memStream.AsStreamForWrite()
    $file.CopyTo($stream)
    $stream.Flush()
    $memStream.Seek(0)
    
    $decoder = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($memStream).GetAwaiter().GetResult()
    $bitmap = $decoder.GetSoftwareBitmapAsync().GetAwaiter().GetResult()
    
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
    if (-not $engine) {
        $lang = New-Object Windows.Globalization.Language("en-US")
        $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($lang)
    }
    
    $result = $engine.RecognizeAsync($bitmap).GetAwaiter().GetResult()
    $lines = @()
    foreach ($line in $result.Lines) {
        $lines += $line.Text
    }
    return ($lines -join "`n")
}

$output = Run-Ocr $ImagePath
Write-Output $output
"""

def extract_text_with_windows_ocr(image_bytes: bytes) -> str:
    """Uses Windows 10/11 built-in Windows.Media.Ocr engine to extract text."""
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        tmp.write(image_bytes)
        tmp_path = tmp.name

    try:
        cmd = [
            "powershell",
            "-NoProfile",
            "-ExecutionPolicy", "Bypass",
            "-Command",
            POWERSHELL_OCR_SCRIPT,
            "-ImagePath", tmp_path
        ]
        proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", timeout=15)
        if proc.returncode == 0:
            return proc.stdout.strip()
        else:
            print(f"[Windows OCR Error]: {proc.stderr}")
            return ""
    except Exception as e:
        print(f"[Windows OCR Exception]: {e}")
        return ""
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass
