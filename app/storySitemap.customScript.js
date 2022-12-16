<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	
	<?php 
	
	$root=HtmlDocument()->website();

	 foreach(GetPlugin('MapStory')->listStories() as $story){
	    
	        $path=$root.'/story/'.$story['id'];
	        $date=explode(' ',$story['features'][0][modificationDate])[0];
	        if(empty($date)){
	             $date=explode(' ',$story['features'][0][creationDate])[0];
	        }
	 
	     ?>
	        
	        <url>
				<loc><?php echo $path?></loc>
				<lastmod><?php echo $date;?></lastmod>
			</url>
	     <?php
	     
	     $path=$root.'/map/story/'.$story['id'];
	        $date=explode(' ',$story['features'][0][modificationDate])[0];
	 
	     ?>
	        
	        <url>
				<loc><?php echo $path?></loc>
				<lastmod><?php echo $date;?></lastmod>
			</url>
	     <?php
	     
	     //echo json_encode($story, JSON_PRETTY_PRINT)."\n\n";
	 }


	?>

</urlset>