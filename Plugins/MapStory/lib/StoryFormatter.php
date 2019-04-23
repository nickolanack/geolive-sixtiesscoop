<?php

namespace MapStory;

class StoryFormatter {

	public function format($list) {

		$hasBirthStory = false;
		$hasRepatriationStory = false;

		$list = $this->sort($list);

		foreach ($list as &$feature) {

			$attributes = $feature['attributes'];

			if ($attributes['isBirthStory'] === "true" || $attributes['isBirthStory'] === true) {

				if (!$hasBirthStory) {
					$hasBirthStory = true;
					$attributes['isRepatriationStory'] = false;
					continue;
				}

				$attributes['isBirthStory'] = false;

			}
			if ($attributes['isRepatriationStory'] === "true" || $attributes['isRepatriationStory'] === true) {
				if (!$hasRepatriationStory) {
					$hasRepatriationStory = true;
					continue;

				}
				$attributes['isRepatriationStory'] = false;
			}

			$feature['attributes'] = $attributes;
		}

		return $list;

	}

	protected function sort($list) {
		//Todo!
		return $list;
	}
}