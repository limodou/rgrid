cp ../README.md ./index.md
branch=`git branch|grep '*'`
if [ "$branch" = "* gh-pages" ]; then
  dir=..
else
  dir=html
fi
cp ../dist/dataset.js $dir/static
cp ../dist/rtable.js $dir/static
parm make -d $dir
