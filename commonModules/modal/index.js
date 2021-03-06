'use strict';

function modal() {
	/*
	 *Modulo encargado de solicitar y organizar el el contenido html necesario para la
	 *generación de un "programa" nuevo
	 *html: platilla que se usa para la creación del modal, es decir, la ruta al archivo
	 *del que se parte para generar el contendido final.
	 *Por defecto está vacio ya que lo normal será generar modulos ya definidos de forma
	 *independiente.
	 *  app:[String]  -> Contiene el nombre de la aplicación y los modulos 
	 *  o pluggins extras que no se cargan por defecto, pero si en esta ocasión o por un determinado contexto. 
	 */
	const fs = require('fs');
	let sleep = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));
	this.ready = 0;
	this.content = {};
	this.openApps = (args, socket) => {
		let id =socket.handshake.address.split(":").slice(-1)[0]+"_"+ modules.server.getCookieValue(socket.handshake.headers.cookie, '_id');
		let l = new modules["LoadApp"](`${__dirname}/../../module/${args[0]}/`, args[0], [args[1]]);
		let instanceName = `${id}_${args[0]}`;
		if (!instances[instanceName]) instances[instanceName] = [];
		let obj = global.modules[args[0]];
		global["instances"][instanceName].push(new obj(id));
		let m = l.secuence();
		m.then( async (a) => {
			let moduleInstance = global["instances"][instanceName].slice(-1)[0];
			let customize = (Object.keys(moduleInstance).indexOf('customize') !=-1);
			if (customize) a = await  moduleInstance.customize(a, id);
			session[id][`${args[0]}.css`] = a.css
			session[id][`${args[0]}.js`] = a.js
			a.html = this.getFrame(args[0], a.html);
			socket.emit('modal', [a.html, args]); });

	};
	this.loadModal = (html = false) => {
		let path = html.split("/").slice(0, -1).join("/") + "/",
			file = '',
			scripts = { js: [], css: [] },
			finalFile, flags = 0,
			scriptsContents = { js: "", css: "" };
		fs.readFile(__dirname + '/bases/modal.html', 'utf-8', (e, cont) => {
			if (e) return console.error(e);
			finalFile = cont;
			flags++;
		});
		fs.readFile(html, 'utf-8', (e, cont) => {
			if (e) return console.error(e);
			let srcScript = [/<script\s.*(src)=\"(.*)\"(\s.*)*><\/script>/g, /<link\s.*(href)=\"(.*)\"(\s.*)*>/],
				m;
			for (let s of srcScript) {
				while ((m = s.exec(cont)) != null) {
					for (let i of m) {
						if (m.indexOf(i) === 0) {
							cont = cont.replace(i, "");
						}
						if (i === "src")
							scripts["js"].push(m[m.indexOf(i) + 1]);
						else if (i === "href")
							scripts["css"].push(m[m.indexOf(i) + 1]);
					}
				}
			}
			for (var i in scripts) {
				for (let s of scripts[i]) {
					s = s.replace(/^\.\//, "")
					fs.readFile(path + s, 'utf-8', (e, c) => {
						scriptsContents[s.split(".").slice(-1)] += c;
						flags++;
						if (flags === 2 + scripts["js"].length + scripts["css"].length) {
							return writeFile.call(this, finalFile, cont, scriptsContents); 
						}
					});
				}
			}
		});
		flags++;
		this.ready++;
		this.replace = (obj, str, clean) => {
			var match, rpl, ret, i = 0,
				regex = /#{(\w*)(\[(\d+|"\w+")])?}/g,
				list, key, content, match, tmpStr;
			while ((match = regex.exec(str)) != null) {
				rpl = (() => {
					if (!obj[match[1]]) return ""
					else if (match[3]) return obj[match[1]][match[3]];
					else return (!Array.isArray(obj[match[1]])) ? obj[match[1]] : match[1];
				})();
				str = (obj[match[1]] || clean) ? str.replace(match[0], rpl) : str;
			}
			regex = /<\s?for\s?(key)="?(\w+)"?\s+(in)=\s?"?(\w+)".*>[\n\t\r\s]*(.*)[\n\t\r\s]*<\/\s*for>/
			let control = 0;
			while ((match = regex.exec(str)) != null) {
				tmpStr = '';
				for (let i in match) {
					if (i == 0) continue;
					if (match[i] == 'key') {
						key = match[parseInt(i) + 1];
					} else if (match[i] == 'in') {
						list = match[parseInt(i) + 1];
						content = match[parseInt(i) + 2];
					}
				};
				let arr = (!Array.isArray(obj[list])) ? [list] : obj[list];
				for (let i in arr) {
					tmpStr += content.replace(RegExp(key, 'g'), arr[i]);
				};
				control++;
				str = str.replace(match[0], tmpStr)
			}
			return str;
		};
		var writeFile = (total, content, src) => {
			/*
			 *Encargado de generar un único archivo con la base del resto
			 */
			let toReplace = {
				"content": content,
				"js": src.js,
				"css": src.css
			};
			this.ready++;
			this.content = toReplace;
			return file;
		};
		this.searchResource = (file) => {
			/*
			 * Función encargada de buscar los require que se pidan y adaptarlos a la
			 * nueva ruta.
			 * Si empieza en "./" se toma la desde la ubicación del archivo, en caso contrario
			 * desde aquí (módulos generales)
			 */
			let pat = /require\('(.*)'\)/g,
				m, path = __dirname.split("/").slice(0, -1).join("/") + "/";
			while ((m = pat.exec(file)) != null) {
				file = file.replace(m[1], path + m[1])
			};
			return file;
		};
	}
	this.getFrame = (name, str) => {
		/*
		 * metodo encargado de juntar crear un frame común para todas las subaplicacionen
		 * name: String -> Nombre de la aplicación
		 * str: String -> contenido html de la aplicación
		 * devuelve un string con el frame más el contenido que se ha pasado por parametro
		*/
		return `<header move="true"><span class="programName">${name}</span><nav><li class="min"><svg viewBox="0 0 2000 2000"><circle cx=1000 cy=1000 r=1000 class="light" /><g id="prop2"><polygon class="middle" points="145 1199 376 801 1875 801 1661 1199 145 1199"/></li> <li class="max"> <svg viewBox="0 0 2000 2000"> <circle cx=1000 cy=1000 r=1000 class="light" /> <polygon class="middle" points="521.18 297.7 562.21 845.22 1015.86 535.92 521.18 297.7"/> <polygon class="middle" points="1478.82 1702.3 1437.79 1154.78 984.14 1464.08 1478.82 1702.3"/> <polygon class="dark" points="1309.43 789.04 1547.65 294.35 1856.95 748 1309.43 789.04"/> <polygon class="dark" points="690.57 1210.96 452.35 1705.65 143.05 1252 690.57 1210.96"/> <rect class="middle" x="760.27" y="759.97" width="253" height="148.37" transform="translate(-315.81 644.48) rotate(-34.29)"/><rect class="cls-3" x="986.45" y="1091.57" width="253" height="148.63" transform="translate(-463.38 829.54) rotate(-34.29)"/> <rect class="dark" x="760.16" y="986.41" width="148" height="253" transform="translate(-481.98 663.29) rotate(-34.29)"/> <rect class="dark" x="1091.46" y="760.45" width="148.25" height="253" transform="translate(-297.1 810.72) rotate(-34.29)"/> </svg></li><li class="close"><svg viewBox="0 0 2000 2000"><circle cx=1000 cy=1000 r=1000 class="light"/> <polygon class="middle" points="1000.5 783 1375.5 135 1501.5 350 1125.5 1000 1000.5 783"/><polygon class="middle" points="1001.5 786 626.5 138 500.5 353 876.5 1003 1001.5 786"/><polygon class="middle" points="1000.5 1217 625.5 1865 499.5 1650 875.5 1000 1000.5 1217"/><polygon class="middle" points="999.5 1214 1374.5 1862 1500.5 1647 1124.5 997 999.5 1214"/></svg></li></nav></header>${str}`;

	};
	this.createModal = async function(obj, name, socket) {
		while (this.ready<2){await sleep(5);}
			let id =socket.handshake.address.split(":").slice(-1)[0]+"_"+ modules.server.getCookieValue(socket.handshake.headers.cookie, '_id');
			this.content.content = this.replace(obj, this.content.content);
			session[id]["modal.css"] = this.content.css
			session[id]["modal.js"] = this.content.js
			this.ready = 0;
			let str = this.getFrame(name, this.content.content);
			socket.emit('modal', [str, ['modal']]);
	};
};
module.exports = modal;
