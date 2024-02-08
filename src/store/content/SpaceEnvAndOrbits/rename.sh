for f in *.PNG; do
	mv -- "$f" "$(basename -- "$f" .PNG)SEAO.png"
done
