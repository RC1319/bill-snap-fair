import subprocess
import os
import tempfile
from PIL import Image, ImageDraw

PS_SCRIPT = r"""
param([string]$ImagePath)

Add-Type -AssemblyName System.Runtime.WindowsRuntime
$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | ? { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.ContainsGenericParameters })[0]

function AwaitWinRT($winRtAsync, $resultType) {
    $asTask = $asTaskGeneric.MakeGenericMethod($resultType)
    $netTask = $asTask.Invoke($null, @($winRtAsync))
    return $netTask.GetAwaiter().GetResult()
}

[Windows.Media.Ocr.OcrEngine, Windows.Foundation.Diagnostics, ContentType = WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.Streams.IRandomAccessStream, Windows.Storage.Streams, ContentType = WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.SoftwareBitmap, Windows.Graphics.Imaging, ContentType = WindowsRuntime] | Out-Null
[Windows.Media.Ocr.OcrResult, Windows.Media.Ocr, ContentType = WindowsRuntime] | Out-Null

function Get-OcrText([string]$filePath) {
    $full = [System.IO.Path]::GetFullPath($filePath)
    $fileOp = [Windows.Storage.StorageFile]::GetFileFromPathAsync($full)
    $file = AwaitWinRT $fileOp ([Windows.Storage.StorageFile])
    
    $streamOp = $file.OpenAsync([Windows.Storage.FileAccessMode]::Read)
    $stream = AwaitWinRT $streamOp ([Windows.Storage.Streams.IRandomAccessStream])
    
    $decoderOp = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
    $decoder = AwaitWinRT $decoderOp ([Windows.Graphics.Imaging.BitmapDecoder])
    
    $bitmapOp = $decoder.GetSoftwareBitmapAsync()
    $bitmap = AwaitWinRT $bitmapOp ([Windows.Graphics.Imaging.SoftwareBitmap])
    
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
    if ($null -eq $engine) {
        $lang = [Windows.Globalization.Language]::new('en-US')
        $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($lang)
    }
    
    $ocrOp = $engine.RecognizeAsync($bitmap)
    $result = AwaitWinRT $ocrOp ([Windows.Media.Ocr.OcrResult])
    
    $lines = @()
    foreach ($line in $result.Lines) {
        $lines += $line.Text
    }
    return ($lines -join "`n")
}

$res = Get-OcrText $ImagePath
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Write-Output $res
"""

def test():
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp_img:
        img = Image.new("RGB", (600, 300), color=(255, 255, 255))
        d = ImageDraw.Draw(img)
        d.text((20, 20), "FRESH MART", fill=(0, 0, 0))
        d.text((20, 60), "1 Rice (5kg) 1 420.00 420.00", fill=(0, 0, 0))
        d.text((20, 100), "Sub Total 1,023.00", fill=(0, 0, 0))
        d.text((20, 140), "Grand Total 1,023.00", fill=(0, 0, 0))
        img.save(tmp_img.name)
        img_path = tmp_img.name

    with tempfile.NamedTemporaryFile(mode="w", suffix=".ps1", delete=False, encoding="utf-8") as ps_file:
        ps_file.write(PS_SCRIPT)
        ps_path = ps_file.name

    try:
        proc = subprocess.run(
            ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ps_path, "-ImagePath", img_path],
            capture_output=True,
            text=True,
            encoding="utf-8"
        )
        print("RETURN CODE:", proc.returncode)
        print("STDOUT:\n" + proc.stdout)
        print("STDERR:\n" + proc.stderr)
    finally:
        if os.path.exists(img_path):
            os.remove(img_path)
        if os.path.exists(ps_path):
            os.remove(ps_path)

if __name__ == "__main__":
    test()
