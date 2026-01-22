# Krunker Style Captcha

A modern, gamified CAPTCHA system inspired by Krunker's aesthetic. This interactive verification challenge requires users to click numbered targets in the correct order to prove they're human.

## Features

- 🎮 **Gamified Experience**: Interactive challenge-based verification
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations
- 📱 **Responsive**: Works on desktop and mobile devices
- 🔒 **Anti-Bot Measures**: Built-in detection for suspicious activity
- 🎯 **Simple Challenge**: Click targets in numerical order (1-5)
- ✨ **Visual Feedback**: Real-time progress tracking and status updates

## How It Works

1. User is presented with 5 numbered targets in random positions
2. User must click the targets in numerical order (1, 2, 3, 4, 5)
3. Progress is tracked with a visual progress bar
4. Upon completion, a verification token is generated
5. Wrong clicks reset the challenge

## Demo

Visit the [GitHub Pages](https://foxy155.github.io/captcha_game) to see it in action!

## Installation

1. Clone this repository:
```bash
git clone https://github.com/foxy155/captcha_game.git
cd captcha_game
```

2. Open `index.html` in your browser, or serve it using a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server
```

## Usage

Simply include the captcha on your page:

```html
<iframe src="https://foxy155.github.io/captcha_game" width="600" height="500"></iframe>
```

Or integrate the files directly into your project.

## Customization

You can customize the captcha by modifying:

- **Colors**: Edit the gradient values in `style.css`
- **Challenge Type**: Modify the challenge logic in `script.js`
- **Number of Targets**: Change `totalTargets` in the `KrunkerCaptcha` class
- **Styling**: Adjust CSS variables and classes in `style.css`

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Security Notes

This is a client-side CAPTCHA implementation. For production use, you should:

- Add server-side verification
- Implement rate limiting
- Add additional anti-bot measures
- Store verification tokens securely
- Implement token expiration

## License

MIT License - feel free to use this project for your own purposes!

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## Credits

Inspired by Krunker.io's modern game aesthetic and user experience design.
