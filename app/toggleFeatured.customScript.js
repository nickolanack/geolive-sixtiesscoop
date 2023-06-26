
if(!Auth('memberof', 'special', 'group')){
    return false;
}

$config=GetConfig('featuredStoriesItems');
$featured=$config->getConfigurationValue('featured');



$plugin=GetPlugin('MapStory');
$list=$plugin->getFeaturesMetadata($json->item);
		$user=$list[0]['uid'];

		if(!is_numeric($user)){

		}

		//features is for debug
		$story=  array(
		    'features'=>$list, 
		    'story'=>$plugin->getUsersStoryMetadata($user), 
		    'user'=>(is_numeric($user)?$plugin->getUsersMetadata($user):null)
		    );
		    
$shouldRemove=false;	    

error_log('check: '.$json->item);

$featured=array_values(array_filter($featured, function($f)use($story, &$shouldRemove, $json){
    
    if($story['features'][0]['id']===$f->id){
        error_log('remove: '.$json->item);
        $remove=true;
        return false;
    }
    return true;
    
}));

if(!$shouldRemove){
    error_log('add: '.$json->item);
    $featured[]=(object)array(
        "id"=>$story['features'][0]['id'],
        "name"=>$story['user']['name']
    );
}

$config->updateConfigurationParameter('featured', $featured);
return array_values($featured);


return true;