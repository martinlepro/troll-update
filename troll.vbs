Set WshShell = CreateObject("WScript.Shell")
For i = 1 To 50
  WshShell.Popup "Erreur critique détectée !", 2, "Windows Update", 16
  WScript.Sleep 500
Next
