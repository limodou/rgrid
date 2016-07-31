cp ../README.md ./index.md
branch=`git branch|grep '*'`
if [ "$branch" = "* gh-pages" ]; then
  dir=..
else
  dir=html
fi
cp ../dist/dataset.js $dir/static
cp ../dist/rtable.js $dir/static
cp ../bower_components/riot/riot+compiler.min.js $dir/static
riot tags $dir/static/tags
parm make -d $dir
