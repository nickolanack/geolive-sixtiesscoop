<?php

namespace Plugin;

class MapStory extends \Plugin implements
\core\ViewController, \core\AjaxControllerProvider, \core\EventListener {

	use \core\AjaxControllerProviderTrait;
	use \core\EventListenerTrait;

	protected $name = 'Create Map Stories';
	protected $description = 'Allows users to create stories by connecting map items';



	// protected function onFacebookLogin($params){


	// }
	protected function onFacebookRegister($params){
		
		
		$photoUrl='https://graph.facebook.com/'.$params->fbuser->id.'/picture?type=large';
		error_log($photoUrl);

		GetPlugin('Attributes');

		$icon='<img src="'.$photoUrl.'" />';

		(new \attributes\Record('profileAttributes'))->setValues($params->user, "user", array(
			"icon"=>'<img src="'.$photoUrl.'" />',
			"name"=>$params->fbuser->name
		));

	}

	public function includeScripts() {

		IncludeJS($this->getPath() . '/js/Stories.js');

	}

	public function getStoryLayerId() {
		return 1;
	}

	

	public function getUsersStoryMarker($itemId, $itemType, $userId = -1) {

		GetPlugin('Maps');

		$feature = new \Marker();
		$feature->setUserId(GetClient()->getUserId());
		
		return $feature;

	}

	public function formatFeatureMetadata($feature, $attributes=null){

		if(!$attributes){
			GetPlugin('Attributes');
			$attr=(new \attributes\Record('storyAttributes'));
			$attributes=$attr->getValues($feature['id'], $feature['type']);
		}


		//if($attributes['isBirthStory']==="true"||$attributes['isBirthStory']===true){
			$attributes['locationImages']='<img src="'.UrlFrom(GetWidget('demoConfig')->getParameter('item0Image')[0] . '?thumb=>48>48').'" />';
		//}
		$feature['attributes']=$attributes;

		return $feature;


	}

	public function getUsersMetadata($userId = -1) {

		if ($userId == -1) {
			$userId = GetClient()->getUserId();
		}

		return (new \attributes\Record('profileAttributes'))->getValues($userId, "user");

	}


	public function getFeaturesMetadata($featureIds){

		GetPlugin('Maps');
		GetPlugin('Attributes');
		$attr=(new \attributes\Record('storyAttributes'));
		$list=array();
		(new \spatial\Features())
			->listLayerFeatures($this->getStoryLayerId())
			->withFeatures($featureIds)
			->iterate(function ($feature) use(&$list, &$attr){

				$attributes=$attr->getValues($feature['id'], $feature['type']);

				$list[]=$this->formatFeatureMetadata($feature, $attributes);


			});


		return $list;


	}

	public function getUsersStoryMetadata($userId = -1) {

		if ($userId == -1) {
			$userId = GetClient()->getUserId();
		}

		GetPlugin('Maps');
		GetPlugin('Attributes');
		$attr=(new \attributes\Record('storyAttributes'));
		$list=array();
		(new \spatial\Features())
			->listLayerFeatures($this->getStoryLayerId())
			->withOwner($userId)
			->iterate(function ($feature) use(&$list, &$attr){

				$attributes=$attr->getValues($feature['id'], $feature['type']);

				$list[]=$this->formatFeatureMetadata($feature, $attributes);


			});

		return $list;

	}

}