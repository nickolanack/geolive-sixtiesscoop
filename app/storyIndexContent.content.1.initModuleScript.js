

var pageNumber=parseInt(document.location.pathname.split('story-index/').pop().split('/').shift());
if(isNaN(pageNumber)){
    pageNumber=0;
}

module.showPage(pageNumber);