Get-ChildItem -Path . -Exclude 'frontend','backend','move-to-frontend.ps1' | Move-Item -Destination frontend
