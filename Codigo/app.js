if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const { isLoggedIn } = require('./middleware.js');
const validator = require('validator');
const Mensaje = require('./models/mensaje');
const Reserva = require('./models/reserva');
const moment = require('moment');
const multer = require('multer');
const { storage } = require('./cloudinary');
const upload = multer({ storage: storage });
const rateLimit = require('express-rate-limit'); 

const userRoutes = require('./routes/users');
const reviewsRoutes = require('./routes/reviews');
const mensajesRoutes = require('./routes/mensajes');
const reservasRoutes = require('./routes/reserva.js');

const adminUserRoutes = require('./routes/RutasAdminUsuarios');
const adminReservationRoutes = require('./routes/RutasAdminReservas');
const adminStatsRoutes = require('./routes/RutasAdminStats');
const adminReviewsRoutes = require('./routes/RutasAdminReview.js');

const app = express();

app.set('trust proxy', 1); 

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

app.use(express.urlencoded({ extended: true }));

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: 'Has excedido el límite de peticiones, por favor intenta nuevamente después de 15 minutos.',
    headers: true,
});

app.use(limiter);

const MongoStore = require('connect-mongo');

const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));

app.use(express.json());
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password'
    },
    async (username, password, done) => {
        try {
            const { user, error } = await User.authenticate()(username, password);

            if (error) {
                if (error.name === 'IncorrectUsernameError' || error.name === 'IncorrectPasswordError') {
                    return done(null, false, { message: 'El usuario o la contraseña no son correctos.' });
                }
                return done(null, false, { message: 'Ha ocurrido un error. Por favor, intenta nuevamente o contacta al soporte si el problema persiste.' });
            }

            if (!user.verified) {
                return done(null, false, { message: 'Debes verificar tu correo electrónico antes de iniciar sesión.' });
            }

            return done(null, user);
        } catch (err) {
            console.error(err);
            return done(null, false, { message: 'Ha ocurrido un error.  Por favor, intenta nuevamente o contacta al soporte si el problema persiste.' });
        }
    }
));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async (req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');

    if (req.user) {
        try {
            const numUnreadMessages = await Mensaje.countDocuments({ para: req.user._id, leido: false });
            res.locals.numUnreadMessages = numUnreadMessages;

            if (req.user.esCuidador) {
                const pendingReservas = await Reserva.find({ cuidador: req.user._id, estado: 'pendiente', leido: false }).populate('usuario');
                res.locals.numPendingReservas = pendingReservas.length;
                res.locals.pendingReservas = pendingReservas.map(reserva => ({
                    _id: reserva._id,
                    estado: reserva.estado,
                    fechaInicioFormatted: moment(reserva.fechaInicio).format('DD/MM/YYYY HH:mm'),
                    fechaFinFormatted: moment(reserva.fechaFin).format('DD/MM/YYYY HH:mm')
                }));
            } else {
                res.locals.numPendingReservas = 0;
                res.locals.pendingReservas = [];
            }
        } catch (error) {
            console.error('Error obteniendo las notificaciones:', error);
            res.locals.numUnreadMessages = 0;
            res.locals.numPendingReservas = 0;
            res.locals.pendingReservas = [];
        }
    } else {
        res.locals.numUnreadMessages = 0;
        res.locals.numPendingReservas = 0;
        res.locals.pendingReservas = [];
    }

    next();
});

app.get('/', (req, res) => {
    res.render('paginaPrincipal');
})

app.get('/sobreNosotros', (req, res) => {
    res.render('sobreNosotros');
})

app.get('/avisoLegal', (req, res) => {
    res.render('avisoLegal');
})

app.get('/rolRegistro', (req, res) => {
    res.render('rolRegistro');
})

app.get('/contacto', (req, res) => {
    res.render('contacto');
})

app.get('/comoFunciona', (req, res) => {
    res.render('comoFunciona');
})

app.get('/sitiosPetFriendly', async (req, res) => {
    res.render('sitiospet');
});

app.get('/admin', isLoggedIn, async (req, res) => {
    res.render('admin/indexAdmin');
});

const catchAsync = require('./utils/catchAsync.js');

app.use('/', userRoutes);
app.use('/mensajes', mensajesRoutes);
app.use('/reservas', reservasRoutes);
app.use('/cuidadores/:id/reviews', reviewsRoutes);

app.use('/admin/usuarios', adminUserRoutes);
app.use('/admin/reservas', adminReservationRoutes);
app.use('/admin/stats', adminStatsRoutes);
app.use('/admin/reviews', adminReviewsRoutes);

const nodemailer = require('nodemailer');

app.post('/enviar-contacto', async (req, res) => {
    const { nombreCompleto, email, mensaje } = req.body;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    let mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject: `Nuevo mensaje de contacto de ${nombreCompleto}`,
        text: `Nombre: ${nombreCompleto}\nEmail: ${email}\nMensaje: ${mensaje}`,
        replyTo: email
    };

    try {
        await transporter.sendMail(mailOptions);
        req.flash('success', 'Mensaje enviado correctamente.');
        res.redirect('/contacto');
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
        req.flash('error', 'Hubo un problema al enviar tu mensaje.');
        res.redirect('/contacto');
    }
});

const Suscriptor = require('./models/suscriptor.js');

app.post('/suscribir', async (req, res) => {
    const { email } = req.body;

    if (!validator.isEmail(email)) {
        req.flash('error', 'El email proporcionado no es válido.');
        return res.redirect('/');
    }

    console.log("Intentando suscribir con el correo:", email);

    try {
        const existeSuscriptor = await Suscriptor.findOne({ email });
        console.log("¿Existe ya el suscriptor?:", !!existeSuscriptor);

        if (existeSuscriptor) {
            console.log("El suscriptor ya existe, no se crea uno nuevo.");
            req.flash('error', 'Este email ya está suscrito.');
            return res.redirect('/');
        }

        const nuevoSuscriptor = new Suscriptor({ email });
        await nuevoSuscriptor.save();
        console.log("Nuevo suscriptor creado con éxito.");
        req.flash('success', '¡Gracias por suscribirte!');
        res.redirect('/');
    } catch (error) {
        console.error('Error al suscribir:', error);
        req.flash('error', 'Hubo un problema al suscribirte. Intenta nuevamente.');
        res.redirect('/');
    }
});

app.all('*', (req, res, next) => {
    res.status(404).render('404');
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = '!Algo ha salido mal!' } = err;
    res.status(statusCode).render('error', { err });
})


const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);

module.exports = app; 
module.exports.io = io;

io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado');

    socket.on('location', (data) => {
        socket.broadcast.emit('new-location', data);
    });
});

if (require.main === module) {
    server.listen(3000, () => {
        console.log('Serving on port 3000');
    });
}
