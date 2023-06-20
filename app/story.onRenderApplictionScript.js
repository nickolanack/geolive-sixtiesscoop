
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
		$userData=(is_numeric($user)?$plugin->getUsersMetadata($user):null);

		if(!is_numeric($user)){

		}
        $story=$plugin->getUsersStoryMetadata($user);
		//features is for debug
		\HtmlDocument()->META(json_encode(
		    array(
    		    'features'=>$list, 
    		    'story'=>$story, 
    		    'user'=>json_encode($userData)
    		    )
		    ), 'og:data');
    
    \HtmlDocument()->META($userData['name'].' | Sixties Scoop Story', 'title');
    \HtmlDocument()->META($userData['name'].' | Sixties Scoop Story', 'og:title');
    
    $description="";
    foreach($story as $feature){
        if(strlen($feature['description'])>strlen($description)){
            $description=$feature['description'];
        }
    }
    \HtmlDocument()->META($description, 'description');
    \HtmlDocument()->META($description, 'og:description');
    
    
   $images = (new \core\WebMedia())->parseImageUrls(implode(' ', array_map(function($s){
       return $s->attributes->locationImages;
   }, $story)));
    
   \HtmlDocument()->META(json_encode($images), 'og:images');
    
}

// \HtmlDocument()->META($url, "title");



// <meta property="og:url"           content="https://www.your-domain.com/your-page.html" />
// <meta property="og:type"          content="website" />
// <meta property="og:title"         content="Your Website Title" />
// <meta property="og:description"   content="Your description" />
// <meta property="og:image"         content="https://www.your-domain.com/path/image.jpg" />

