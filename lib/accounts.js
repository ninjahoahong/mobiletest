var router = require('express').Router();

var Accounts = {
	/*
	 * List all users data stored by IBM Data Service.
	 * 
	 * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/users
	 * 
	 */
	 getUsers: function(req, res){
		var query = req.data.Query.ofType('User');
		query.find().done(function(users) {
			res.json(users);
		}, function(err){
		    res.send(err);
		});
	},

	/*
	 * Find the user's data for the given parameter. The sample code below filters user data by the id attribtue. It can be filtered by other attribute set. 
	 * Take the name attribute as an example, it can be filtered by name attribute by using api 'query.find({name: 'MBaaS'})'.
	 * 
	 * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/users/1
	 * 
	 */
	 getUser: function(req, res){
		var query = req.data.Query.ofType('User');
		query.find({id: req.params.id}, {limit: 1}).done(function(user) {
			if (user.length==1) {
				res.json(user);
			}
			else {
				res.status(404);
				res.send('No such user found');
			}
		}, function(err){
		    res.send(err);
		});
	},

	/*
     * Create a new user with the json data contained in request body. The content-type must be set to application/json.
     * To make the below sample code run correctly, the json data must contain id attribute, here is the sample.
     * {
     *  'id':'1',
     *  'name': 'MBaaS'
     * }
     * 
     * To test: curl -X POST -H 'Content-Type: application/json' -d '{\'id\':\'1\', \'name\':\'MBaaS\'}' http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/users
     * 
     */
	 createUser: function(req, res){
		var user = req.data.Object.ofType('User', req.body);
		user.save().then(function(saved) {
			res.json(saved);
		}, function(err){
		    res.send(err);
		});		
	},

	/*
	 * Modify the user's data matched the id attribute with the put request body.
	 * 
	 * To test: curl -X PUT -H 'Content-Type: application/json' -d '{\'id\':\'1\', \'name\':\'MBaaS\'}' http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/users/1
	 * 
	 */
	 updateUser: function(req, res){	
		var query = req.data.Query.ofType('User');
		query.find({id: req.params.id}, {limit: 1}).then(function(user) {
			user.forEach(function(person){
				person.set(req.body);
				person.save().then(function(updated) {
					res.json(updated);
				}, function(err){
				    res.send(err);
				});
			});
		}, function(err){
		    res.send(err);
		});
	},

	/*
	 * Delete the user's data for the given parameter. Below shows how to delete the user data by the id attribtue. 
	 * It can be also deleted by other attribute like name by changing query.find option.
	 * 
	 * To test: curl -X DELETE http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/users/1
	 * 
	 */
	 deleteUser: function(req, res){
		var query = req.data.Query.ofType('User');
		query.find({id: req.params.id}, {limit: 1}).done(function(users) {
			if (users.length==1) {
				users[0].del().done(function(deleted) {
					var isDeleted = deleted.isDeleted();
					if (deleted.isDeleted()) {
						res.send('delete successfully.');
					}
					else {
						res.status(500);
						res.send('delete failed.');
					}
				}, function(err){
				    res.send(err);
				});
			}
			else {
				res.status(404);
				res.send('No such user found');
			}
		}, function(err){
		    res.send(err);
		});
	}
};

router.get('/users',    	Accounts.getUsers);

router.get('/users/:id', 	Accounts.getUser);

router.post('/users',		Accounts.createUser);

router.put('/users/:id',	Accounts.updateUser);

router.delete('/users/:id',   	Accounts.deleteUser);

module.exports = exports = router;


	

