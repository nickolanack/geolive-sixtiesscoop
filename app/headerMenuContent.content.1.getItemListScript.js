var links= [
    new MockDataTypeItem({name:"Home", link:"/", click:function(){
        window.location.href="/"
    }}), 
    new MockDataTypeItem({name:"Map", link:"/map", click:function(){
        window.location.href="/map"
    }}), 
    new MockDataTypeItem({name:"Visualize", link:"/visualize", click:function(){
        window.location.href="/visualize"
    }}), 
    new MockDataTypeItem({
        hidden:true,
        name:"Dispersion Map", link:"/map/dispersion", click:function(){
        window.location.href="/map/dispersion"
    }}), 
    new MockDataTypeItem({
        hidden:true,
        name:"Resources", link:"/resources", click:function(){
        window.location.href="/resources"
    }}), 
    new MockDataTypeItem({name:"Search",  link:"/search", click:function(){
        window.location.href="/search"
    }}), 
    new MockDataTypeItem({name:"Help", link:"/help" }), 
    new MockDataTypeItem({name:"About", link:"https://sixtiesscoopnetwork.org/" }), 
    new MockDataTypeItem({name:"Sign in", link:"/login", click:function(e){
                                            
                                        
        
                                             (new UIModalDialog(
												application, 
												AppClient, 
												{
													"formName": 'loginFormView',
													"formOptions": {
														template: "form"
													}
												}
											)).show(function(){

					            			

											}).on('complete', function(item){
											    
											    
											    
											});
											
											return false;
        
        
        
        
    }})
];


if(AppClient.getUserType()!=="guest"){
        
    links.pop();
    links.push(new MockDataTypeItem({name:"Sign out", click:function(){
        
        
        
                                            (new UIModalDialog(
												application, 
												new MockDataTypeItem({
												    mutable:true,
												    mergeFieldValues:true,
												    // appendFieldObject:false, //is false by default if mergeFieldValues. must have toObject method
												    updateField:"data", 
												    data:{}, 
												    "stepOptions":{
												        width:700
												    },
												    parameters:[
												        {
								                	      "name": "heading",
								                	      "description": "",
								                	      "fieldType": "heading",
								                	      "defaultValue": "Are you sure?",
								                	      "options": {}
								                	    }
												    ]
												}), 
												{
													"formName": 'genericParametersForm',
													"formOptions": {
														template: "form",
														"className": "alert-view",
                        								"showCancel":true,
                        								"labelForSubmit":"Yes, log me out",
                        								"labelForCancel":"Cancel",
                        								"closable":true
													}
												}
											)).show(function(yes){
                                                
                                                if(yes){ 
                                                    AppClient.logout(); 
                                                    
                                                }
                                                
											});
        
        
    }}))
 
 
 if(AppClient.getUserType()=="admin"){
    links.push(new MockDataTypeItem({name:"[]", className:"admin-toggle", click:function(){
        if(document.body.hasClass('hide-admin')){
            document.body.removeClass('hide-admin');
            return
        }
        document.body.addClass('hide-admin');
    }}));
 }
 
  if(AppClient.getUserType()!="guest"){
      links.splice(1,0,new MockDataTypeItem({name:"My story",  link:"/me", click:function(){
        window.location.href="/me"
    }}))
  }
 
    
}


return links;