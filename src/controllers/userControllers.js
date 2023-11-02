const fs = require('fs');
const path = require('path');
const usersFilePath = path.join(__dirname, '../views/users/usuarios.json')
const productsFilePath = path.join(__dirname, '../views/products/productos.json')
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../database/models');
const { Console } = require('console');

const usuario = {
    datos: function () {
        return JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));
    },
    index: async (req, res) => {
        let producto = undefined
        console.log(req.session.userLogin)
        if (req.session.userLogin) {
            let datosDelUsuario = await db.User.findByPk(req.session.userLogin)
            res.render('userPanel', { usuario: datosDelUsuario, product: producto })
        }
    },

    registro: (req, res) => {
        res.render('register')
    },

    /*-- CRUD USUARIO CREAR --*/
    //Create: function(req, res) => {
    //db.User.create({
    //name: req.body.name,
    //email: req.body.email,
    //phone: req.body.phone,
    //password: req.body.password,
    //image:req.body.image,
    //id y admin no son introducidos por el usuario...    
    //});
    //}

    procesoCrear: async (req, res) => {
        let errors = validationResult(req)
        if (errors.isEmpty()) {
            const data = req.body;

            if (req.file) {
                var userImage = req.file.filename
            } else {
                var userImage = "default.png"
            }

            const users = await db.User.create({
                //const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));

                //const nuevoUser = {
                //id: users[users.length - 1].id + 1,
                name: data.name,
                email: data.email,
                phone: parseInt(data.phone),
                password: bcrypt.hashSync(req.body.password, 10),
                image: userImage,
                admin: 0
            })

            //users.push(nuevoUser);
            //fs.writeFileSync(usersFilePath, JSON.stringify(users, null, " "))
            res.redirect('/');
            //....NO ESTA CORRIENDO LINEA 65....
        }
        else {
            res.render('register', {
                errors: errors.array(),
                old: req.body
            })
        }
    },

    login: (req, res) => {
        res.render('login', {
            mensajeP: false,
            mensajeEmail: false,
        })
    },

    processLogin: async (req, res) => {

        let errors = validationResult(req)

        if (errors.isEmpty()) {
            let dataUsers = await db.User.findOne({
                where: {
                    email: req.body.email
                }
            })

            if (dataUsers) {
                // let validadContra = bcrypt.compareSync(req.body.password, dataUsers.password);
                //let validarContra = req.body.password == dataUsers.password
                if (bcrypt.compareSync(req.body.password, dataUsers.dataValues.password)) {
                    //bcrypt.compareSync(req.body.password, users[i].password)
                    req.session.userLogin = dataUsers.idusers
                    req.session.admin = dataUsers.admin
                    res.redirect('/usuario')
                    
                } else {
                    return res.render('login', {
                        errors: errors.array(),
                        old: req.body,
                        mensajeEmail: false,
                        mensajeP: 'contraseña es invalida'
                    })
                }
            } else {
                res.render('login', {
                    mensajeP: false,
                    mensajeEmail: 'email es invalido'
                })
            }
        } else {
            res.render('login', {
                errors: errors.errors,
                old: req.body,
                mensajeP: false,
                mensajeEmail: 'email es invalido'
            })
        }

    },

    carrito: (req, res) => {
        const productos = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));
        res.render('productCart', { productos: productos });
    },
}
module.exports = usuario