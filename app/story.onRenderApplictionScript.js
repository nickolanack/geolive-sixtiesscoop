
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

if(is_numeric($url)){
    
    $plugin=GetPlugin('MapStory');
    
    $list=$plugin->getFeaturesMetadata($url);
		$user=$list[0]['uid'];

		if(!is_numeric($user)){

		}

		//features is for debug
		\HtmlDocument()->META(json_encode(
		    array(
    		    'features'=>$list, 
    		    'story'=>$plugin->getUsersStoryMetadata($user), 
    		    'user'=>(is_numeric($user)?$plugin->getUsersMetadata($user):null)
    		    )
		    ), 'og:data');
    
    \HtmlDocument()->META($user->name.' | Sixties Scoop Story', 'title');
    \HtmlDocument()->META($user->name.' | Sixties Scoop Story', 'og:title');
}

// \HtmlDocument()->META($url, "title");



// <meta property="og:url"           content="https://www.your-domain.com/your-page.html" />
// <meta property="og:type"          content="website" />
// <meta property="og:title"         content="Your Website Title" />
// <meta property="og:description"   content="Your description" />
// <meta property="og:image"         content="https://www.your-domain.com/path/image.jpg" />

