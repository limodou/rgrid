#coding=utf8
from __future__ import unicode_literals

"""
This config will be used for parm project settings.
You can change them to fit your needs.
"""

#available plugins
#mermaid
plugins = []

#mermaid init
mermaid_init = {'startOnLoad':True}

#encoding of md file
encoding = 'utf8'

# The suffix of source filenames.
source_suffix = ['.md', '.markdown']

#template setttings
template_dirs = "templates"
templates = {'index':'index.html',
             'examples':'examples.html',
             '*':'default.html',
             'documents':'documents.html'}

tag_class = {
    
'table':'table table-bordered',
'pre':'+prettyprint',

}

# pre code theme css only : sons-of-obsidian, sunburst
# can be found in static/asset directory
pre_css = 'light'

# The short X.Y version.
version = '1.0'

# General information about the project.
project = u'rGrid'
project_url = './index.html'
copyright = u'2016, Limodou'
description = u'''rGrid is a riot grid component.
'''
download_url = 'https://github.com/limodou/rgrid/archive/master.zip'

# You can add custom css files, just like
# custom_css = ['/static/custom.css']
custom_css = []

# config menus
# format: ('name', 'caption', 'link')
menus = [
    ('home', 'Home', 'index.html'),
    ('examples', 'Examples', 'examples.html'),
    ('documents', 'Documents', 'documents.html'),
]

#page footer
footer = """
<p>Designed by Limodou, Copyright %s</p>
<p>CSS framework <a href="https://github.com/twitter/bootstrap">Bootstrap</a>, Markdown parser lib <a href="https://github.com/limodou/par">Par</a> and this page is created by <a href="https://github.com/limodou/parm">Parm</a> tool.</p>
""" % copyright

# The master toctree document.
master_doc = 'index'

#download source display
download_source = 'View Source'

#theme
#default will use semantic
#there are also bootstrap, semantic support
theme = 'bootstrap'

disqus = 'rgrid'

#disqus support
#this use uliwebdoc, so you should replace it with your account name
disqus_text = '''<div id="disqus_thread" style="margin:20px;"></div>
 <script type="text/javascript">
     /* * * CONFIGURATION VARIABLES: EDIT BEFORE PASTING INTO YOUR WEBPAGE * * */
     var disqus_shortname = '%s'; // required: replace example with your forum shortname

     /* * * DON'T EDIT BELOW THIS LINE * * */
     (function() {
         var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
         dsq.src = 'https://' + disqus_shortname + '.disqus.com/embed.js';
         (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
     })();
 </script>
 <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
 <a href="https://disqus.com" class="dsq-brlink">comments powered by <span class="logo-disqus">Disqus</span></a>
''' % disqus

#this use uliwebdoc, so you should replace it with your account name
disqus_js = '''<script type="text/javascript">
   /* * * CONFIGURATION VARIABLES: EDIT BEFORE PASTING INTO YOUR WEBPAGE * * */
   var disqus_shortname = '%s'; // required: replace example with your forum shortname

   /* * * DON'T EDIT BELOW THIS LINE * * */
   (function () {
       var s = document.createElement('script'); s.async = true;
       s.type = 'text/javascript';
       s.src = 'https://' + disqus_shortname + '.disqus.com/count.js';
       (document.getElementsByTagName('HEAD')[0] || document.getElementsByTagName('BODY')[0]).appendChild(s);
   }());
   </script>
''' % disqus

search = True
domain = 'limodou.github.io/rgrid'
search_html = """
<div class="item">
  <div class="ui icon input">
    <form id="searchform">
    <input name="q" type="text" placeholder="Search...">
    </form>
  </div>
</div>
"""

search_js = """
<script type="text/javascript">
$(function(){
    var form = $('#searchform');
    form.submit(function(e){
        e.preventDefault();
        var wq=$('input[name="q"]').val();
        var link="http://www.google.com/search?q=site:%s "+wq;
        window.open(link);

    });
});
</script>
""" % domain
