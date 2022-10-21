<?php

namespace MapStory;

class CardFormatter {

	public function format($feature, $attributes = null) {

		if(is_object($feature)){
			$feature=get_object_vars($feature);
		}
		

		if (!$attributes) {
			GetPlugin('Attributes');
			$attr = (new \attributes\Record('storyAttributes'));
			$attributes = $attr->getValues($feature['id'], "MapStory.card");
		}

		if(!empty($attributes['locationData'])){

			$location=json_decode($attributes['locationData']);
			if(json_encode($location->coordinates)!==json_encode($feature['coordinates'])){
				$attributes['locationData']=null;
			}

		}

		if (empty($attributes['locationData'])) {

			$jsonLocationData = $this->parseLocationData($feature);
			if (!empty($jsonLocationData)) {
				$attributes['locationData'] = $jsonLocationData;
			}
		}

		$attributes['locationData'] = json_decode($attributes['locationData']);

		if (empty($attributes['locationName']) || $attributes['locationName'] === "false") {

			$attributes['locationName'] = $this->parseLocationName($feature['id'], $attributes);

		}

		$feature['attributes'] = $attributes;

		return $feature;
	}

	protected function parseLocationName($itemId, $attributes) {

		$locationName = false;
		foreach ($attributes['locationData']->geocode->address_components as $addressResult) {
			if (in_array('locality', $addressResult->types)) {
				$locationName = $addressResult->long_name;
				break;
			}
		}

		\core\DataStorage::LogQuery("Update Location Name");

		if ($locationName && $locationName != "false") {
			(new \attributes\Record('storyAttributes'))->setValues($itemId, "MapStory.card", array(
				"locationName" => $locationName,
			));
		}

		return $locationName;
	}

	protected function parseLocationData($featureMeta) {
		GetPlugin('GoogleMaps');
		$geocode = (new \GoogleMaps\Geocoder())->fromCoordinates(
			$featureMeta['coordinates'][0],
			$featureMeta['coordinates'][1],
			GetPlugin('Maps')->getParameter('googleMapsServerApiKey', false)
		);
		error_log(json_encode($geocode));
		if (key_exists('results', $geocode) && count($geocode->results)) {

			$locationData = array(
				"coordinates" => $featureMeta['coordinates'],
				"geocode" => $geocode->results[0],
			);

			$jsonLocationData = json_encode($locationData);

			\core\DataStorage::LogQuery("Update Location Geocode Data");

			(new \attributes\Record('storyAttributes'))->setValues($featureMeta['id'], "MapStory.card", array(
				"locationData" => $jsonLocationData,
			));

			return $jsonLocationData;

		}

		return null;

	}

}