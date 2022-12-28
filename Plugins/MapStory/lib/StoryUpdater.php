<?php

namespace MapStory;

class StoryUpdater {

	protected $feature = null;

	protected function getPlugin() {
		return GetPlugin('MapStory');
	}

	protected function getFeature($json) {
		if (is_null($this->feature)) {
			$this->feature = $this->getPlugin()->getUsersStoryMarker($json->id);
		}
		return $this->feature;
	}

	public function fromObject($json) {

		$feature = $this->getFeature($json);

		if ($feature->getId() <= 0 && empty($json->location)) {
			throw new \Exception('Requires location for new items: ' . $feature->getId());
		}

		$this->setName($json);

		$feature->setDescription($json->description);

		if (!empty($json->location)) {
			$feature->setCoordinates($json->location->lat, $json->location->lng);
		}

		$feature->setLayerId($this->getPlugin()->getStoryLayerId());

		$defaultIcon = UrlFrom(GetWidget('siteConfig')->getParameter('storyIcon')[0] . '?thumb=>48>48');
		$feature->setIcon($defaultIcon);

		$this->setIcon($json);
		(new \spatial\FeatureLoader())->save($feature);
		$this->setAttributes($json);

		return $feature;

	}

	protected function setName($json) {

		GetPlugin('Attributes');

		$feature = $this->getFeature($json);
		$profile = (new \attributes\Record('profileAttributes'))->getValues($feature->getUserId(), "user");

		$list = array();

		$legalName = trim($profile['name']);
		$birthName = trim($profile['birthName']);

		if (!empty($legalName)) {
			$list[] = $legalName;
			if (!empty($birthName)) {
				$list[0] .= ' (' . $birthName . ')';
			}
		}
		if (empty($legalName) && (!empty($birthName))) {
			$list[] = $birthName;
		}
		if (!empty($json->address)) {
			$list[] = $json->address;
		}

		if (key_exists('attributes', $json) &&
			key_exists('storyAttributes', $json->attributes) &&
			(!empty($json->attributes->storyAttributes->locationDate))) {
			$list[] = $json->attributes->storyAttributes->locationDate;
		}

		$feature->setName(implode(', ', $list));
	}

	protected function setAttributes($json) {

		$feature = $this->getFeature($json);

		GetPlugin('Attributes');
		if (key_exists('attributes', $json)) {
			foreach ($json->attributes as $table => $fields) {
				(new \attributes\Record($table))->setValues($feature->getId(), "MapStory.card", $fields);
			}
		}

		(new \attributes\Record($table))->setValues($feature->getId(), "MapStory.card", array(
			"locationName" => $json->address,
		));
	}

	protected function setIcon($json) {

		$feature = $this->getFeature($json);

		$defaultIcon = UrlFrom(GetWidget('siteConfig')->getParameter('storyIcon')[0] . '?thumb=>48>48');
		$feature->setIcon($defaultIcon);

		if (key_exists('attributes', $json)) {
			if (key_exists('storyAttributes', $json->attributes)) {
				$attrs = $json->attributes->storyAttributes;
				if (key_exists('isBirthStory', $attrs) && $attrs->isBirthStory) {
					$defaultIcon = UrlFrom(GetWidget('siteConfig')->getParameter('birthIcon')[0] . '?thumb=>48>48');
					$feature->setIcon($defaultIcon);
				}

				if (key_exists('isRepatriationStory', $attrs) && $attrs->isRepatriationStory) {
					$defaultIcon = UrlFrom(GetWidget('siteConfig')->getParameter('repatriationIcon')[0] . '?thumb=>48>48');
					$feature->setIcon($defaultIcon);
				}
			}
		}

	}

	public function updateUserProfile($user, $data) {

		$newUserData = array();
		foreach ([$data->profile, $data->publishing] as $userData) {
			if (isset($userData->Attribute_profileAttributes_Object)) {
				$newUserData = array_merge($newUserData, get_object_vars($userData->Attribute_profileAttributes_Object));
			}
		}

		if (empty($newUserData)) {
			return;
		}

		(new \attributes\Record('profileAttributes'))->setValues($user, "user", $newUserData);

	}

	public function updateUserBirthStory($user, $storyData, $currentStoriesData = null) {

		$storyData->icon = 'https://sixtiesscoop.geoforms.ca/php-core-app/users_files/user_files_1/Uploads/7pW_da6_[ImAgE]_[G]_noG.png?thumb=>48>48';
		$storyData->Attribute_storyAttributes_Object->isBirthStory = true;
		return $this->updateUserStory($user, $storyData, $currentStoriesData);
	}

	public function updateUserRepatriationStory($user, $storyData, $currentStoriesData = null) {

		$storyData->icon = 'https://sixtiesscoop.geoforms.ca/php-core-app/users_files/user_files_1/Uploads/VE4_dUd_[G]_bgL_[ImAgE].png?thumb=>48>48';
		$storyData->Attribute_storyAttributes_Object->isRepatriationStory = true;
		return $this->updateUserStory($user, $storyData, $currentStoriesData);
	}

	public function updateUserStory($user, $storyData, $currentStoriesData = null) {

		if (!$currentStoriesData) {
			$currentStoriesData = $this->getPlugin()->getUsersStoryMetadata($user);
		}

		if (!isset($storyData->Attribute_storyAttributes_Object)) {
			throw new \Exception('Expects attributes');
		}

		if (!(isset($storyData->id) && (intval($storyData->id) > 0))) {

			if (!(isset($storyData->address) && !empty($storyData->address))) {

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
			$location = $geocode->results[0]->geometry->location;

			$feature = new \Marker();
			$feature->setUserId($user);

			error_log($location);
			$feature->setCoordinates($location->lat, $location->lng);

			$layer = (new \spatial\LayerLoader())->fromName('Story Layer');
			$feature->setLayerId($layer->getId());

			$feature->setIcon(isset($storyData->icon) ? $storyData->icon : 'https://sixtiesscoop.geoforms.ca/php-core-app/users_files/user_files_1/Uploads/shv_[ImAgE]_d3r_[G]_g3M.png?thumb=>48>48');

			$storyData->id = (new \spatial\FeatureLoader())->save($feature);

			if (isset($storyData->Attribute_storyAttributes_Object)) {
				(new \attributes\Record('storyAttributes'))->setValues($storyData->id, "MapStory.card", $storyData->Attribute_storyAttributes_Object);
			}

			return;

		}

		$currentStory = null;
		foreach ($currentStoriesData as $story) {
			//error_log(json_encode($story));
			if (intval($storyData->id) === intval($story['id'])) {
				$currentStory = $story;
			}
		}

		if (!$currentStory) {
			throw new \Exception("did not find story with id: " . $storyData->id);
		}

		if (!(isset($storyData->address) && !empty($storyData->address))) {
			GetPlugin('Maps');
			(new \spatial\FeatureLoader())->delete((new \spatial\FeatureLoader())->fromId($storyData->id));
		}

		if (isset($storyData->description)) {
			(new \spatial\FeatureLoader())->save(
				(new \spatial\FeatureLoader())->fromId($storyData->id)
					->setDescription($storyData->description)
			);
		}

		if (isset($storyData->Attribute_storyAttributes_Object)) {

			$storyData->Attribute_storyAttributes_Object->locationName = $storyData->address;

			(new \attributes\Record('storyAttributes'))->setValues($storyData->id, "MapStory.card", $storyData->Attribute_storyAttributes_Object);
		}

		return;

		//throw new \Exception('Not implemented yet, new story card');

	}

}