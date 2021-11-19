all:
	ffmpeg -avoid_negative_ts 1 -f concat -i list.txt -c copy DownFall.webm
	mv DownFall.webm DownFall.mov
