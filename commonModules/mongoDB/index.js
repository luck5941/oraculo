function mongoDB(bbdd_name) {
	const MongoClient = require('mongodb').MongoClient;
	this.name = bbdd_name;
	this.init = ()=> {
		console.log("se va a iniciar la conexion en "+ this.name);
		MongoClient.connect('mongodb://127.0.0.1:27017/', (err, db) => {
			if (err) return console.error(err);
			console.log("conexion iniciada");
			this.conn = db.db(this.name);
			this.db = db;
		});
	};
	this.newCollection = (name) => {
		this.conn.createCollection(name, (e, r) => {
			if (e) return console.error (e);
			console.log("colección creada");
		});
	};
	this.insert = (obj)=> {
		console.log("obj en insert")
		console.log(obj)
		if (typeof(obj) === 'string') obj = JSON.parse(obj);
		for (let o in obj){
			let method = Array.isArray(obj[o]) ? "insertMany":"insertOne";
			this.conn.collection(o)[method](obj[o], (e) => (e) ?console.error(e) :null);
		}
	};
	this.query = (obj, field = {}) => {
		if (typeof(obj) === 'string') obj = JSON.parse(obj);
		let collection = Object.keys(obj)[0];
		let answer = this.conn.collection(collection).find(obj[collection], field).toArray();
		return answer;
	};
	this.exit = () => {
		this.db.close();
		console.log("conexion cerrada");
	};
};
module.exports = mongoDB
