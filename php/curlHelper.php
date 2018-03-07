<?php
/*
hayden thring
www.httech.com.au
lib: https://github.com/acumenbrands/rest_suite
replace xxxxxx , and adjust deployment urls
*/
class curlHelper{
	private $curlHandle;
	
	private $authHeader = "Authorization: NLAuth nlauth_account=xxxxxx,nlauth_email=xxxxxx@xxxxxx,nlauth_signature=xxxxxx,nlauth_role=xxxxxx";
	
	private $initializeUrl = "https://rest.netsuite.com/app/site/hosting/restlet.nl?script=238&deploy=1";
	private $loadUrl = "https://rest.netsuite.com/app/site/hosting/restlet.nl?script=237&deploy=1";
	private $searchUrl = "https://rest.netsuite.com/app/site/hosting/restlet.nl?script=239&deploy=1";
	private $deleteUrl = "https://rest.netsuite.com/app/site/hosting/restlet.nl?script=240&deploy=1";
	private $savedSearchUrl = "https://rest.netsuite.com/app/site/hosting/restlet.nl?script=241&deploy=1";
	private $transformUrl = "https://rest.netsuite.com/app/site/hosting/restlet.nl?script=242&deploy=1";
	private $upsertUrl = "https://rest.netsuite.com/app/site/hosting/restlet.nl?script=243&deploy=1";

	function __construct(){	
		$this->curlHandle = curl_init();		
		curl_setopt($this->curlHandle, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($this->curlHandle, CURLOPT_HTTPHEADER, array($this->authHeader, "Content-Type: application/json"));
	
	}	
	function __destruct(){		
        curl_close($this->curlHandle);
    }
    
    function makeCall($url, $request){
		curl_setopt($this->curlHandle, CURLOPT_URL, $url);
		curl_setopt($this->curlHandle, CURLOPT_POSTFIELDS, json_encode($request));
		$result = curl_exec($this->curlHandle);
		$result = json_decode($result, true);
		return $result;
    }
/*   
	initialize example request:
    $request = ["record_type"=> "inventoryItem"];
*/    
    function initialize($request){
		return $this->makeCall($this->initializeUrl, $request);
		
    }
/*	
	load example request:
    $request = [["internalid"=> "1121", "record_type"=> "inventoryItem"]];
*/   
    function load($request){		
		return $this->makeCall($this->loadUrl, $request);
    }
/*
	search example request:
	$request = [	"record_type"=> "inventoryItem",
					"batch_size"=> "1",
					"lower_bound"=> "0",
					"search_filters"=>[['name'=>'internalId','operator'=>'is','value'=>'1121']],
					'search_columns' => [['name'=>'internalId','join'=>'null','sort'=>'true']]	];
*/    
	function search($request){		
		return $this->makeCall($this->searchUrl, $request);
    }
    function delete($request){		
		return $this->makeCall($this->deleteUrl, $request);
    }
/*	
	saved search example request:
	$request = ['record_type' => 'transaction',
			'search_id'	  => 903,
			'lower_bound' => 0,
			'batch_size' => 1000
	];    
*/    
    function savedSearch($request){		
		return $this->makeCall($this->savedSearchUrl, $request);
    } 
/*    
	transform example request:
	$request =  [
		'record_data' => [
			[
			'internalid' => $nsOrder['internalId'],
			'source_type' => 'invoice',
			'result_type' => 'customerpayment',
			'transform_values' => '',
			'literal_fields'=> [
								'undepfunds' => 'F',
								'account' => '742',//1025 Web Transaction
								'customer' => $nsOrder['entity']['internalId'],
								'paymentmethod' =>  '8',//cc
								'memo' => $message,
								],
			'sublists'=> [
							['name'=>'apply',
							 'update' => [
											[
											'match'=> 'internalid',
											'data'=>[			
														'internalid'=>$nsOrder['internalId'],
														'apply'=>'T',
														'amount' => $nsOrder['amountRemaining']
													]
											]
										 ]
							]
						 ]
				]
			]
	]; 
*/			  
    function transform($request){		
		return $this->makeCall($this->transformUrl, $request);
    }
/*    
	upsert example request:
	$request =  [
		'record_data' => [
				[
				'internalid' => 1234,
				'record_type'=> 'invoice',
				'literal_fields'=> [
									'memo' => 'thank you, please come again'
									]
				]
			]
		];
*/
     function upsert($request){		
		return $this->makeCall($this->upsertUrl, $request);
    }   
}

?>
