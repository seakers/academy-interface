for f in *.PNG; do
	mv -- "$f" "$(basename -- "$f" .PNG)ITSC.png"
done
