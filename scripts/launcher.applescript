on run {input, parameters}
	set port_output to do shell script "lsof -i :1337 || true"
	if port_output is not "" then
		do shell script "open http://localhost:1337"
	else
		tell application "iTerm"
			activate
			
			if (count of windows) is 0 then
				create window with default profile
			end if
			
			tell current window
				create tab with default profile
				tell current session
					write text "cd ~/Projects/plump-gpt"
					write text "./start dev"
					delay 1.5
					set name to "Plump GPT"
				end tell
			end tell
		end tell
	end if
	
	return input
end run
