(function() {
	var debug = 0;
	
    // Create the connector object
    var myConnector = tableau.makeConnector();

    // Define the schema
    myConnector.getSchema = function(schemaCallback) {

		var event_cols = [{
			id: "type",
			dataType: tableau.dataTypeEnum.string
		},
		{
			id: "degree",
			dataType: tableau.dataTypeEnum.string
		},
		{
			id: "source",
			dataType: tableau.dataTypeEnum.string
		},
		{
			id: "status",
			dataType: tableau.dataTypeEnum.string
		},
		{
			id: "description",
			dataType: tableau.dataTypeEnum.string
		},
		{
			id: "createdAt",
			dataType: tableau.dataTypeEnum.string
		}];

        var eventsTable = {
            id: "events",
            alias: "Events for a project",
            columns: event_cols
        };

        // Schema for time and URL data
        var waste_cols = [{
            id: "id",
            dataType: tableau.dataTypeEnum.string
        },
		{
            id: "createdAt",
            dataType: tableau.dataTypeEnum.string
        },
		{
            id: "consignmentNumber",
            dataType: tableau.dataTypeEnum.string
        },
		{
            id: "subcontractorName",
            dataType: tableau.dataTypeEnum.string
        },
		{
            id: "carrierName",
            dataType: tableau.dataTypeEnum.string
        },
		{
            id: "carrierLicenceId",
            dataType: tableau.dataTypeEnum.string
        },
		{
            id: "facilityOperatorName",
            dataType: tableau.dataTypeEnum.string
        },
		{
            id: "facilitySiteAddress",
            dataType: tableau.dataTypeEnum.string
        },
		{
            id: "facilityPermitId",
            dataType: tableau.dataTypeEnum.string
        },
		{
            id: "sICCcode",
            dataType: tableau.dataTypeEnum.string
        }];

        var wasteTable = {
            id: "waste",
            alias: "Waste records for a project",
            columns: waste_cols
        };
		
        schemaCallback([eventsTable, wasteTable]);
    };

    // Download the data
    myConnector.getData = function(table, doneCallback) {
		
		if (debug) {
			console.log("tableau.connectionData = " + tableau.connectionData);
		}
		
		var credentialsObj = JSON.parse(tableau.connectionData);
		
		var domain = "public-api-dev.qualisflow.com";
		
		var baseURI = "https://" + domain + "/api/v1.0/";
//		var projectAndPageArgs = "ProjectId=" + projectId + "&page[size]=1000";
		var projectAndPageArgs = "ProjectId=" + credentialsObj.projectId + "&page[size]=1000";
		var wasteURI = baseURI + "waste/records?" + projectAndPageArgs
		var eventsURI = baseURI + "events?" + projectAndPageArgs;

		var url = table.tableInfo.id == "waste" ? wasteURI : eventsURI;
		

        $.ajax({type: "GET",
				url: url,
				headers: {'Authorization': 'Bearer ' + credentialsObj.apiKey},
				success: function(resp) {
            var records = table.tableInfo.id == "waste" ? resp.records : resp.events,
                tableData = [], currentRecord;

            var i = 0;

            if (table.tableInfo.id == "waste") {
                for (i = 0, len = records.length; i < len; i++) {
					
					currentRecord = records[i];
					
                    tableData.push({
						"id": currentRecord.recordId,
						"createdAt": currentRecord.createdAt,
						"consignmentNumber": currentRecord.consignmentNumber,
						"subcontractorName": currentRecord.subcontractorName,
						"carrierName": currentRecord.carrierName,
						"carrierLicenceId": currentRecord.carrierLicenceId,
						"facilityOperatorName": currentRecord.facilityOperatorName,
						"facilitySiteAddress": currentRecord.facilitySiteAddress,
						"facilityPermitId": currentRecord.facilityPermitId,
						"sICCcode": currentRecord.sICCcode
                    });
					
					if (debug) {
						console.log(currentRecord.recordId + " " + currentRecord.createdAt + " " + currentRecord.consignmentNumber + " " + currentRecord.subContractorName + " " +
							currentRecord.carrierName + " " + currentRecord.carrierLicenceId + " " + currentRecord.facilityOperatorName + " " + currentRecord.facilitySiteAddress +
							" " + currentRecord.facilityPermitId + " " + currentRecord.sICCode);
					}
                }
            }

            if (table.tableInfo.id == "events") {
                for (i = 0, len = records.length; i < len; i++) {
					
					currentRecord = records[i];
					
                    tableData.push({
						"type": currentRecord.type,
						"degree": currentRecord.degree,
						"source": currentRecord.source,
						"status": currentRecord.status,
						"description": currentRecord.description,
						"createdAt": currentRecord.createdAt,
                    });
					
					if (debug) {
						console.log(currentRecord.type + " " + currentRecord.degree + " " + currentRecord.source + " " +
										currentRecord.status + " " + currentRecord.description + " " + currentRecord.createdAt);
					}
                }
            }

			if (!debug) {
				table.appendRows(tableData);
				doneCallback();
			}
        }});
    };

    tableau.registerConnector(myConnector);

    // Create event listeners for when the user clicks the button
    $(document).ready(function() {
        $("#submitButton").click(function() {

			var credentialsObj = {
				apiKey: $('#apiKey').val().trim(),
				projectId: $('#projectId').val().trim()
			};
			
			tableau.connectionData = JSON.stringify(credentialsObj);

			if (debug) {
				myConnector.getSchema(function(tableList){
					console.log("passed " + tableList.length + " tables");
					for(i=0, len=tableList.length; i < len; i++) {
						console.log("table " + i + " = " + tableList[i].id + ", " + tableList[i].alias);
					}
				});

				myConnector.getData({tableInfo: {id: "events"}}, function(){});

				myConnector.getData({tableInfo: {id: "waste"}}, function(){});
			} else {
				tableau.connectionName = "Qflow"; // This will be the data source name in Tableau
				tableau.submit(); // This sends the connector object to Tableau
			}
        });
    });
})();
