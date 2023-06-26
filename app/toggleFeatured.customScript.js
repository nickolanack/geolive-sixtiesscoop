
//return GetConfig('featuredStoriesItems')->getConfigurationValue('featured');

$plugin=GetPlugin('MapStory');
$list=$plugin->getFeaturesMetadata($json->item);
		$user=$list[0]['uid'];

		if(!is_numeric($user)){

		}

		//features is for debug
		return  array(
		    'features'=>$list, 
		    'story'=>$plugin->getUsersStoryMetadata($user), 
		    'user'=>(is_numeric($user)?$plugin->getUsersMetadata($user):null)
		    );



return true;