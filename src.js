// deps:
// npm install chokidar

const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const chokidar = require('chokidar');

const file = './src.md';
const outfile = './a1.pdf';

const watcher = chokidar.watch(file, {
    ignored: /[\/\\]\./, // ignores .dotfiles
    persistent: true
})
    .on('change', compile)
    .on('ready', compile);

var checksum = '';
function compile() {
    exec(`md5 ${file}`, function (error, stdout, stderr) {

        console.log('checking md5');

        if (error !== null) {
            console.log('exec error: ' + error);
            return;
        }
        const newChecksum = stdout.toString();

        if(checksum == newChecksum) {
            return;
        }

        console.log('running pandoc');

        spawn('pandoc', [
            '-H',
            'preamble',
            '-V',
            'geometry:margin=1in',
            '-S',
            '-s',
            '-o',
            outfile,
            'src.md'
        ]).on('close', function(code) {

            if(code != 0) {
                console.error('pandoc error');
                return;
            }

            console.log(`pandoc done. opening ${outfile}`);
            exec(`open ${outfile}`);
            exec(`echo $(wc -w ${file}) words`).stdout.pipe(process.stdout);
        }).on('error', function (err) {
            console.log('pandoc err:', err);
        }).stderr.pipe(process.stdout);

    });
};
