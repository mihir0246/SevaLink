const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email from Google'), null);

        // Find existing user
        let user = await User.findOne({ email });

        if (!user) {
          // Auto-register — default role volunteer, admin can be changed later
          const firstName = profile.name?.givenName || profile.displayName.split(' ')[0];
          const lastName = profile.name?.familyName || '';

          user = new User({
            firstName,
            lastName,
            email,
            password: `google_oauth_${profile.id}`, // placeholder, not used
            role: 'volunteer',
            googleId: profile.id,
          });
          await user.save();

          // Also create Volunteer profile
          const volunteer = new Volunteer({
            userId: user._id,
            firstName,
            lastName,
            email,
            skills: [],
            city: '',
            rating: 5.0,
            availableHours: 10,
            actionsCompleted: 0,
            hoursContributed: 0,
          });
          await volunteer.save();
        } else if (!user.googleId) {
          // Existing email/password user — link Google ID
          user.googleId = profile.id;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
