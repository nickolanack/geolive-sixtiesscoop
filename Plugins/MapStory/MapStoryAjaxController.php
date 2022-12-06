<?php

class MapStoryAjaxController extends core\AjaxController implements \core\extensions\plugin\PluginMember {

	use \core\extensions\plugin\PluginMemberTrait;

	protected function saveStoryItem($json){



		if($json->id>0&&!Auth('write', $json->id, $json->type)){
			return $this->setError('No access');
		}

		$feature=(new \MapStory\FeatureUpdater())->fromObject($json);

		//put this here because it might change some boolean attributes;
		$story=$this->getPlugin()->getUsersStoryMetadata();

		return array('item'=>$this->getPlugin()->formatFeatureMetadata($feature->getMetadata()), 'story'=>$story);

	}


	protected function deleteStoryItem($json){

		if(!Auth('write', $json->id, $json->type)){
			return $this->setError('No access');
		}

		GetPlugin('Maps');
		return !!(new \spatial\FeatureLoader())->delete((new \spatial\FeatureLoader())->fromId($json->id));
		
	}


	protected function deleteStory($json){

		// if(!Auth('write', $json->id, $json->type)){
		// 	return $this->setError('No access');
		// }

		// GetPlugin('Maps');
		// return !!(new \spatial\FeatureLoader())->delete((new \spatial\FeatureLoader())->fromId($json->id));
		
	}


	protected function getStoriesWithItems($json){

		
		$list=$this->getPlugin()->getFeaturesMetadata($json->items);

		$users=array();
		foreach ($list as $feature) {
			if(!in_array($feature['uid'], $users)){

				$users[]=$feature['uid'];
			}
		}
		
		
		

		return  array(
			'results'=>(new \MapStory\CardSearch())->formatResults($list)
		);

	}

	protected function getStoryWithItem($json){

		$list=$this->getPlugin()->getFeaturesMetadata($json->item);
		$user=$list[0]['uid'];

		//features is for debug
		return  array('features'=>$list, 'story'=>$this->getPlugin()->getUsersStoryMetadata($user), 'user'=>$this->getPlugin()->getUsersMetadata($user));

	}


	protected function getStoryWithUser($json){

		return  array('story'=>$this->getPlugin()->getUsersStoryMetadata($json->user), 'user'=>$this->getPlugin()->getUsersMetadata($json->user));

	}

	protected function getStory(){

		return  array('story'=>$this->getPlugin()->getUsersStoryMetadata(), 'user'=>$this->getPlugin()->getUsersMetadata());

	}


	protected function search($json){

		return  array('results'=>$this->getPlugin()->searchStories($json->search));

	}

	protected function advancedSearch($json){

		return  array('results'=>$this->getPlugin()->searchStoriesAdvanced($json->search));

	}


	protected function getFeatureList($json){

		$list=$this->getPlugin()->getFeatureListMetadata($json->items);
		return  array('results'=>$list);

	}


	protected function getFilterResults($json){

		GetPlugin('Maps');


		$prefix='attribute_';
		$list=array();


		$filterOutOfProvince='{ 
			"filters":[{
				"field":"movesOutOfProvince",
				"value":true
			}]
		}';


		(new \spatial\AttributeFeatures('storyAttributes'))
			->withType('MapStory.card') //becuase attribute type is overriden
			->withAllAttributes($prefix)
			->withFilter($filterOutOfProvince)
			->iterate(function($result)use(&$list, $prefix, $json){

				$locationData=json_decode($result->{$prefix.'locationData'});
				$nextLocationData=json_decode($result->{$prefix.'nextLocationData'});

				$storyUser=intval($result->{$prefix.'storyUser'});


				if((!in_array($storyUser, $list))&&$this->checkLocationFilters($json->filter, $locationData, $nextLocationData)){
					$list[]=$storyUser;
				}
				
			});

		return array('results'=>$list);



	}




	private function checkLocationFilters($filter, $locationData, $nextLocationData){
		return $this->checkLocationFilter($filter->sources, $locationData)||$this->checkLocationFilter($filter->dests, $nextLocationData);
	}
	private function checkLocationFilter($filter, $locationData){

		foreach($filter as $code){

			$code=strtolower(str_replace(' ', '_',  $code));

			foreach ($locationData->geocode->address_components as $address) {
				$short=strtolower(str_replace(' ', '_',  $address->short_name));
				if($short===$code){

					error_log($short.' === '.$code);
					return true;
				}

				$long=strtolower(str_replace(' ', '_',  $address->long_name));
				if($long===$code){
					error_log($long.' === '.$code);
					return true;
				}
			}

		}

		return false;


	}


	protected function getYearResults($json){

		GetPlugin('Maps');


		$prefix='attribute_';
		$list=array();


		$filterAdoptionStories='{ 
				"filters":[{
					"field":"isAdoptionStory",
					"value":true
				}]
			}';


		(new \spatial\AttributeFeatures('storyAttributes'))
			->withType('MapStory.card') //becuase attribute type is overriden
			->withAllAttributes($prefix)
			->withFilter($filterAdoptionStories)
			->iterate(function($result)use(&$list, &$minYr, &$maxYr, $prefix, $json){

				$year=date('Y', strtotime(intval($result->{$prefix.'locationDate'}));

				if(!isset($list[$year])){
					$list[$year]=0;
				}
				$list[$year]++;

				
			});

		return array('results'=>$list);



	}

	protected function listStories($json){

		GetPlugin('Maps');

		$list=array();
		$prefix='attribute_';


		$filterBirthStories='{ 
				"filters":[{
					"field":"isBirthStory",
					"value":true
				}]
			}';

		$index=0;
		$limit=false;
		if(isset($json->limit)&&is_array($json->limit)&&count($json->limit)==2){
			$limit=[intval($json->limit[0]), intval($json->limit[1])];
		}

		(new \spatial\AttributeFeatures('storyAttributes'))
			->withType('MapStory.card') //becuase attribute type is overriden
			->withAllAttributes($prefix)
			->withFilter($filterBirthStories)->iterate(function($result)use(&$list, $prefix, &$index, $limit){

				//result is not a metadata object

				if((!$limit)||$index>=$limit[0]&&$index<$limit[1]){
					$list[]=array('id'=>$result->id, 'features'=>array( $this->getPlugin()->formatFeatureMetadata($result, $prefix)));
				}else{
					$list[]=array('id'=>$result->id,);
				}


				$index++;

			});

		return array('results'=>$list);



	}

	protected function getDispersionGraph($json){
		
		GetPlugin('Maps');

		$list=array();
		$prefix='attribute_';


		$filterBirthStories='{ 
				"filters":[{
					"field":"isBirthStory",
					"value":true
				}]
			}';

		$filterOutOfProvince='{ 
			"filters":[{
				"field":"movesOutOfProvince",
				"value":true
			}]
		}';


		(new \spatial\AttributeFeatures('storyAttributes'))
			->withType('MapStory.card') //becuase attribute type is overriden
			->withAllAttributes($prefix)
			->withFilter($filterOutOfProvince)->iterate(function($result)use(&$list, $prefix){



				$list[]= array(
					'locationData'=>json_decode($result->{$prefix.'locationData'}),
					'nextLocationData'=>json_decode($result->{$prefix.'nextLocationData'})
				);
			});

		return array('results'=>$list);


	}


	protected function sendMessage($json){
		$user=$this->getPlugin()->getUsersMetadata($json->user);


		if(!($user['allowContact']==="true"||$user['allowContact']===true)){

		}
			

		$email=$user["email"];

		if($email=='some@email.address}'){
			$email='nickblackwell82@gmail.com';
		}

		if(GetClient()->isGuest()){

			return $this->setNonCriticalError('not allowed, or need email verification');


			/**
			 * 	Should send verification email. then send on verification click
			 *
			 	$email=$json->email;

				 $links=GetPlugin('Links');
	             $emailToken=$links->createDataCode('onVerifyEmailMessageLink', $json);
	             return array(
	             	'token'=>$emailToken
	             );
             */

		}

		GetPlugin('Email')->getMailerWithTemplate('contact.message', array(
			'subject'=>$json->subject,
			'message'=>$json->message,
			'user'=>$user,
			'sender'=>GetClient()->getUserMetadata()
		))
		->to($email)
		->send();
	
		return array('user'=>$user);




		return array('user'=>$user);
	}

}