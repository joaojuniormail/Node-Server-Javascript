'use strict';

// constants
const routeCreator = require('./../../../common/route-creator')();
const messageEnum = require('./../../../common/enum/message.enum');

// repository patterns
let LoginRepository = require('./Login.repository');

// model domains
let Login = require('./Login.model');
let AppUtil = require('./../../../common/app-util');
let Response = require('./../../../common/model/Response.model');
let ResponseData = require('./../../../common/response-data');

//controller
let LoginController = require('./Login.controller');

class LoginService {

	constructor(appContext, httpOptions) {
		this._context = appContext;
		this._options = JSON.parse(JSON.stringify(httpOptions));

		//INIT REPOSITORY
		let servicePath = httpOptions.getLocalPathPBase() + '/manager/login';
		let loginRepository = new LoginRepository();


		//INSERT
		this._login = async (req, res) => {
			let params = await AppUtil.getParams(req);
			let login = new Login();

			try {
				global.populateToService(login, params, "body", "LOGIN", "query", 2);

				let dataController = new LoginController(login, 'login');
				if (dataController instanceof Response) {
					res.status(422);
					res.send(dataController);
					res.end();
					return;
				}
			} catch (err) {
				res.status(500);
				ResponseData.errorResponse(err, (data) => {
					data.message.setMessage(messageEnum.server500);
					res.send(data);
					res.end();
				});
				return;
			}

			loginRepository.loginData(login, res, (data) => {
				res.send(data);
				res.end();
			});
		}

		/*----------------------------- ROUTES -----------------------------*/


		/**
		 * @swagger
		 * /api/manager/login:
		 *   post:
		 *     tags:
		 *       - login_service
		 *     summary: Autenticação
		 *     requireAD: false
		 *     onlyLocalhost: false
		 *     description: Requisição responsável pela autenticação do usuário do domínio Active Directory
		 *     parameters:
		 *       - name: objeto
		 *         in: body
		 *         description: 
		 *         required: true
		 *         schema: 
		 *           $ref: '#/definitions/Login'
		 *     produces:
		 *       - application/json
		 *     responses:
		 *       200:
		 *         description:
		 *         schema:
		 *           $ref: '#/definitions/User'
		 */
		routeCreator.bind(this._context, this._options.verbEnum.POST, servicePath, this._login);


	}
}

module.exports = exports = LoginService;