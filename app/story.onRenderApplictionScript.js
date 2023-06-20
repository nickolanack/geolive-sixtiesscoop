
(new \core\extensions\widget\WidgetRenderer($targetInstance))->addInlineViews(array(
    'story', 
    'headerMenuContent', 
    'bottomSection', 
    'placeholderLabelItem', 
    'storyPageContent', 
    'sidePanelInfoDetail'
));
GetWidget('home')->renderDependencies($targetInstance);


// $url=$_SERVER['REQUEST_URI'];
// $url=explode('/', $url);
// $url=array_pop($url);

// $url=explode('?', $url);
// $url=array_shift($url);

// \HtmlDocument()->META($url, "title");



// <meta property="og:url"           content="https://www.your-domain.com/your-page.html" />
// <meta property="og:type"          content="website" />
// <meta property="og:title"         content="Your Website Title" />
// <meta property="og:description"   content="Your description" />
// <meta property="og:image"         content="https://www.your-domain.com/path/image.jpg" />

\HtmlDocument()->META("Blanks story", "title");