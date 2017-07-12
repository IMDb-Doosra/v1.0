var bcrypt = require('bcryptjs');
var hash = bcrypt.hashSync('ramukaka', 10);
if (bcrypt.compareSync('ramukaka', hash)) {
    console.log("tuchiya");
}
else {
    console.log("serious gadbad");
}