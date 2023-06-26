
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
$featured=array_values(array_filter($featured, function($f)use($story, &$shouldRemove){
    
    if($story['features'][0]['id']===$f->id){
        $remove=true;
        return false;
    }
    return true;
    
}));

if(!$shouldRemove){
    $featured[]=(object)array(
        "id"=>$story['features'][0]['id'],
        "name"=>$story['user']['name']
    );
}

$config->updateConfigurationParameter('featured', $featured);
return array_values($featured);


return true;