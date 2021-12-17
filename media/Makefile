all:
	ffmpeg -avoid_negative_ts 1 -f concat -i list.txt -c copy DownFall.webm
	ffmpeg -i DownFall.webm DownFall.mp4
	rm DownFall.webm
