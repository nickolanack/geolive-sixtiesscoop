
(new \core\extensions\widget\WidgetRenderer($targetInstance))->addInlineViews(array(
    'story', 
    'headerMenuContent', 
    'bottomSection', 
    'placeholderLabelItem', 
    'storyPageContent', 
    'sidePanelInfoDetail'
));
GetWidget('home')->renderDependencies($targetInstance);


$url=$_SERVER['REQUEST_URI'];
$url=explode('/', $url);
$url=array_pop($url);

$url=explode('?', $url);
$url=array_shift($url);

echo $url;