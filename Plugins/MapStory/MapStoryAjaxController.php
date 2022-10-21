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

		$list=(new \spatial\AttributeFeatures('storyAttributes'))
			->withType('MapStory.card') //becuase attribute type is overriden
			->withAllAttributes($prefix)
			->withFilter($filterBirthStories)->get();

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