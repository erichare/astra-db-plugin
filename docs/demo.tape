# Terminal demo for the README: `vhs docs/demo.tape` → assets/demo.gif
# Uses --dry-run and a pre-connected profile, so no token is typed or shown.
Output assets/demo.gif

Set Shell "bash"
Set FontSize 18
Set Width 1200
Set Height 680
Set Padding 24
Set Theme "Catppuccin Mocha"
Set TypingSpeed 45ms

Hide
Type "export PS1='$ ' && clear"
Enter
Show

Type "npx -y @erichare/astra-mcp init --dry-run --agents claude-code,cursor,vscode"
Sleep 400ms
Enter
Sleep 7s

Type "npx -y @erichare/astra-mcp doctor"
Sleep 400ms
Enter
Sleep 7s

Sleep 2s
