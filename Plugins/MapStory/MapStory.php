<?php

namespace Plugin;

class MapStory extends \Plugin implements
\core\ViewController, \core\AjaxControllerProvider, \core\EventListener, \core\PluginDataTypeProvider{

	use \core\AjaxControllerProviderTrait;
	use \core\EventListenerTrait;
	use \core\PluginDataTypeProviderTrait;

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
			"icon"=>$icon,
			"name"=>$params->fbuser->name
		));

	}

	public function includeScripts() {

		IncludeJS($this->getPath() . '/js/Stories.js');

	}

	public function getStoryLayerId() {
		return 1;
	}

	

	public function getUsersStoryMarker($itemId, $userId = -1) {

		GetPlugin('Maps');

		$itemId=(int)$itemId;
		if($itemId>0){
			$feature=(new \spatial\FeatureLoader())->fromId($itemId);
			return $feature;
		}

		$feature = new \Marker();
		$feature->setUserId(GetClient()->getUserId());
		
		return $feature;

	}

	public function formatFeatureMetadata($feature, $attributes=null){

		if(!$attributes){
			GetPlugin('Attributes');
			$attr=(new \attributes\Record('storyAttributes'));
			$attributes=$attr->getValues($feature['id'], "MapStory.card");
		}


		// if($attributes['isBirthStory']==="true"||$attributes['isBirthStory']===true){
		// 	$attributes['locationImages']='<img src="'.UrlFrom(GetWidget('demoConfig')->getParameter('item0Image')[0] . '?thumb=>48>48').'" />';
		// }
		//
		if(!empty($attributes['locationData'])){
			//check that location data matches latlng
		}	
		
		if(empty($attributes['locationData'])){
			GetPlugin('GoogleMaps');
			$geocode=(new \GoogleMaps\Geocoder())->fromCoordinates(
				$feature['coordinates'][0], 
				$feature['coordinates'][1],
				GetPlugin('Maps')->getParameter('googleMapsServerApiKey', false)
			);
			error_log(json_encode($geocode));
			if(key_exists('results',$geocode)&&count($geocode->results)){
				

				$locationData=array(
					"coordinates"=>$feature['coordinates'],
					"geocode"=>$geocode->results[0]
				);


				$jsonLocationData=json_encode($locationData);
				(new \attributes\Record('storyAttributes'))->setValues($feature['id'], "MapStory.card", array(
					"locationData"=>$jsonLocationData
				));

				$attributes['locationData']=$jsonLocationData;

			}
		}
		
		$attributes['locationData']=json_decode($attributes['locationData']);

		if(empty($attributes['locationName'])||$attributes['locationName']==="false"){
			
			
			$locationName=false;
			foreach($attributes['locationData']->geocode->address_components as $addressResult){
				if(in_array('locality', $addressResult->types)){
					$locationName=$addressResult->long_name;
					break;
				}
			}


			if($locationName&&$locationName!="false"){
				(new \attributes\Record('storyAttributes'))->setValues($feature['id'], "MapStory.card", array(
					"locationName"=>$locationName
				));
			}
			$attributes['locationName']=$locationName;

		
			
		}


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

				$attributes=$attr->getValues($feature['id'], "MapStory.card");

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

		$hasBirthStory=false;
		$hasRepatriationStory=false;

		(new \spatial\Features())
			->listLayerFeatures($this->getStoryLayerId())
			->withOwner($userId)
			->iterate(function ($feature) use(&$list, &$attr, &$hasBirthStory, &$hasRepatriationStory){

				$attributes=$attr->getValues($feature['id'], "MapStory.card");


				if($attributes['isBirthStory']==="true"||$attributes['isBirthStory']===true){
					if($hasBirthStory){
						$attributes['isBirthStory']=false;
					}else{
						$hasBirthStory=true;
					}
				}
				if($attributes['isRepatriationStory']==="true"||$attributes['isRepatriationStory']===true){
					if($hasRepatriationStory){
						$attributes['isRepatriationStory']=false;
					}else{
						$hasRepatriationStory=true;
					}
				}

				$list[]=$this->formatFeatureMetadata($feature, $attributes);


			});

		return $list;

	}


	public function searchStories($keyword) {

		GetPlugin('Maps');
		GetPlugin('Attributes');
		$attr=(new \attributes\Record('storyAttributes'));
		$list=array();

		$users=array();

		(new \spatial\Features())
			->withFilter(array(array(
				"join"=>'OR',
				array(
					'field'=>'name',
					'comparator' => ' LIKE ',
					'value' => '%'.$keyword.'%'
				),
				array(
					'field'=>'description',
					'comparator' => ' LIKE ',
					'value' => '%'.$keyword.'%'
				)

			)))
			->iterate(function ($feature) use(&$list, &$attr, &$users){

				$attributes=$attr->getValues($feature['id'], "MapStory.card");

				$result=$this->formatFeatureMetadata($feature, $attributes);

				if(!key_exists($result['uid'], $users)){
					$users[$result['uid']]=$this->getUsersMetadata($result['uid']);
				}

				$result['userData']=$users[$result['uid']];

				$list[]=$result;


			});

		return $list;

	}

	public function getFeatureListMetadata($featureIds){

		GetPlugin('Maps');
		GetPlugin('Attributes');
		$attr=(new \attributes\Record('storyAttributes'));
		$list=array();

		$users=array();

		(new \spatial\Features())
			->listLayerFeatures($this->getStoryLayerId())
			->withFeatures($featureIds)
			->iterate(function ($feature) use(&$list, &$attr, &$users){

				$attributes=$attr->getValues($feature['id'], "MapStory.card");

				$result=$this->formatFeatureMetadata($feature, $attributes);

				if(!key_exists($result['uid'], $users)){
					$users[$result['uid']]=$this->getUsersMetadata($result['uid']);
				}

				$result['userData']=$users[$result['uid']];

				$list[]=$result;

			});


		return $list;


	}

}