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



	/**
	 * Save an entire story group, and profile
	 */
	protected function saveStory($json){


		if(!Auth('write', $json->user, 'user')){
			return $this->setError('No access');
		}

		$stories=$this->getPlugin()->getUsersStoryMetadata($json->user);
		$user=$this->getPlugin()->getUsersMetadata($json->user);



		$this->updateUserProfile($json->user, $json->storyData);
		

		$this->updateUserBirthStory($json->user, $json->storyData->birth, $stories);

		
		foreach($json->storyData->stories as $story){
			$this->updateUserStory($json->user, $story, $stories);
		}
		
		
		$this->updateUserRepatriationStory($json->user, $json->storyData->repatriation, $stories);



		return array(
			'story'=>$stories[0],
			'newStory'=>$json->storyData->birth
			
		);
	}



	private function updateUserProfile($user, $data){


		$newUserData=array();
		foreach([$data->profile, $data->publishing] as $userData){
			if(isset($userData->Attribute_profileAttributes_Object)){
				$newUserData=array_merge($newUserData, get_object_vars($userData->Attribute_profileAttributes_Object));
			}
		}

		if(empty($newUserData)){
			return;
		}


		(new \attributes\Record('profileAttributes'))->setValues($user, "user", $newUserData);


	}

	
	private function updateUserBirthStory($user, $storyData, $currentStoriesData=null){

		

		$storyData->icon='https://sixtiesscoop.geoforms.ca/php-core-app/users_files/user_files_1/Uploads/7pW_da6_[ImAgE]_[G]_noG.png?thumb=>48>48';
		$storyData->Attribute_storyAttributes_Object->isBirthStory=true;
		return $this->updateUserStory($user, $storyData, $currentStoriesData);
	}

	private function updateUserRepatriationStory($user, $storyData, $currentStoriesData=null){

		$storyData->icon='https://sixtiesscoop.geoforms.ca/php-core-app/users_files/user_files_1/Uploads/VE4_dUd_[G]_bgL_[ImAgE].png?thumb=>48>48';
		$storyData->Attribute_storyAttributes_Object->isRepatriationStory=true;
		return $this->updateUserStory($user, $storyData, $currentStoriesData);
	}

	private function updateUserStory($user, $storyData, $currentStoriesData=null){

		if(!$currentStoriesData){
			$currentStoriesData=$this->getPlugin()->getUsersStoryMetadata($user);
		}


		if(!isset($storyData->Attribute_storyAttributes_Object)){
			throw new \Exception('Expects attributes');
		}

		if(!(isset($storyData->id)&&(intval($storyData->id)>0))){
		

			if(!(isset($storyData->address)&&!empty($storyData->address))){
					
				/**
				 * Ignore empty story. Form will submit empty data for birth and repatriation story
				 */

				return;
			}

			GetPlugin('GoogleMaps');
			GetPlugin('Maps');


			$geocode = (new \GoogleMaps\Geocoder())->fromString(
				$storyData->address,
				GetPlugin('Maps')->getParameter('googleMapsServerApiKey', false)
			);

			error_log(json_encode($geocode));
			$location=$geocode->results[0]->geometry->location;

			$feature = new \Marker();
			$feature->setUserId($user);
			
			error_log($location);
			$feature->setCoordinates($location->lat, $location->lng);


			$layer = (new \spatial\LayerLoader())->fromName('Story Layer');
			$feature->setLayerId($layer->getId());

			$feature->setIcon(isset($storyData->icon)?$storyData->icon:'https://sixtiesscoop.geoforms.ca/php-core-app/users_files/user_files_1/Uploads/shv_[ImAgE]_d3r_[G]_g3M.png?thumb=>48>48');
			
			$storyData->id = (new \spatial\FeatureLoader())->save($feature);


			if(isset($storyData->Attribute_storyAttributes_Object)){
				(new \attributes\Record('storyAttributes'))->setValues($storyData->id, "MapStory.card", $storyData->Attribute_storyAttributes_Object);
			}

			return;
			
		}




		$currentStory=null;
		foreach($currentStoriesData as $story){
			//error_log(json_encode($story));
			if(intval($storyData->id)===intval($story['id'])){
				$currentStory=$story;
			}
		}

		if(!$currentStory){
			throw new \Exception("did not find story with id: ".$storyData->id);
		}

		if(isset($storyData->Attribute_storyAttributes_Object)){
			(new \attributes\Record('storyAttributes'))->setValues($storyData->id, "MapStory.card", $storyData->Attribute_storyAttributes_Object);
		}


		return;
	
		





		//throw new \Exception('Not implemented yet, new story card');

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

		if(!is_numeric($user)){

		}

		//features is for debug
		return  array('features'=>$list, 'story'=>$this->getPlugin()->getUsersStoryMetadata($user), 'user'=>(is_numeric($user)?$this->getPlugin()->getUsersMetadata($user):null));

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

		/*

			$filterAdoptionStories='{ 
				"filters":[{
					"field":"isAdoptionStory",
					"value":true
				}]
			}';

		*/
	

		if(isset($json->{'filter-stack'})){
			$stacks=[];
			foreach($json->{'filter-stack'} as $filter){
				$stacks[]=$this->filterYearlyResults($json, $filter)['results'];
			}


			$min=min(array_map(function($stack){
				return intval(array_keys($stack)[0]);
			}, $stacks));

			$max=max(array_map(function($stack){
				return intval(array_keys($stack)[count($stack)-1]);
			}, $stacks));


			foreach($stacks as $index=>$stack){

				$padded=[];
			
				for ($i=$min-1; $i <= $max; $i++) { 
					$padded[''.$i]=isset($stack[''.$i])?$stack[''.$i]:0;
				}

				$stacks[$index]=$padded;

				
			}


			return array('results'=>$stacks);

		}


		return $this->filterYearlyResults($json, $json->filter);

	}


	protected function filterYearlyResults($json, $filter=null){



		GetPlugin('Maps');


		$prefix='attribute_';
		$list=array();


		$minYr=INF;
		$maxYr=-INF;

		$query=(new \spatial\AttributeFeatures('storyAttributes'))
			->withType('MapStory.card') //becuase attribute type is overriden
			->withAllAttributes($prefix);

		if($filter){
			$query->withFilter($filter);
		}

		$query->iterate(function($result)use(&$list, &$minYr, &$maxYr, $prefix, $json){



				$year=date('Y', strtotime(intval($result->{$prefix.'locationDate'})));

				if(intval($year)>intval(date('Y'))-1){
					return;
				}

				$minYr=min($minYr, $year);
				$maxYr=max($maxYr, $year);

				if(!isset($list[$year])){
					$list[$year]=0;
				}
				$list[$year]++;

				
			});

		$out=[];
		for($i=$minYr;$i<=$maxYr;$i++){
			$out[''.$i]=isset($list[''.$i])?$list[''.$i]:0;
		}

		return array('results'=>$out);



	}

	protected function listStories($json){


		$limit=false;
		if(isset($json->limit)&&is_array($json->limit)&&count($json->limit)==2){
			$limit=[intval($json->limit[0]), intval($json->limit[1])];
		}

		$list=$this->getPlugin()->listStories($limit);

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