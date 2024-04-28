const express = require('express');
const { Pool } = require('pg');
const dotenv = require("dotenv")
dotenv.config()
const {v2:cloudinary} = require("cloudinary")
const bodyParser = require("body-parser")
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const twilio = require('twilio')(accountSid, authToken);


const app = express();
const port =  process.env.PORT || 3000;

// Replace with your PostgreSQL credentials
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
const pool = new Pool({
connectionString:"postgres://traffic_violation_user:Ob0NOkTxYIFdz08gyPxutPHRLAEDPUfA@dpg-co90rvcf7o1s7390rfo0-a.oregon-postgres.render.com/traffic_violation?ssl=true"
});


// cloudinary.config({ 
//   cloud_name: 'dvb6lx7rm', 
//   api_key: '195399976547861', 
//   api_secret: 'KmQUTyS9XNAV0HCKrLYapZmODoI' 
// });

pool.connect((err)=>{
  if(err){
    console.log(err)
  }else{
    console.log("db connected to server successfully")
  }
})
 // Parse incoming JSON data

app.post('/register', async (req, res) => {
// owner_id
// vehicle_type
// bike_name
// plate_number
// violations
// fine_amount
// owner_photo
// phone_no
// owner_name
// created_at
// updated_at
  const dummydatares = await fetch("https://dummyapi.io/data/v1/user?limit=10",{
  headers:{
    "app-id":"661282af0d27b16500799137"
  }
})
const {data} = await dummydatares.json()

  console.log("register_body",req.body)
  console.log("dummy data",data)
  try {
    const created_at = Date.now();
    const updated_at = Date.now()
    const { vehicle_type, bike_name,phone_no,owner_name,plate_number /* ...other fields */ } = await req.body[0];
const owner_photo = await data[0].picture
console.log("owner_photo",owner_photo)

const values = [vehicle_type, bike_name,plate_number,owner_photo,phone_no,owner_name,created_at,updated_at];
    // const queryDEP = `INSERT INTO owners (owner_id,vehicle_type, bike_name
    //         ,plate_number,violations,fine_amount,owner_photo,created_at,updated_at)
    //                VALUES (DEFAULT,$1,$2,$3,$4,$5,$6,$7,NOW(),NOW())`;
const query = `INSERT INTO owners(vehicle_type,bike_name,plate_number,owner_photo,phone_no,owner_name,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$6,to_timestamp($7/1000.0),to_timestamp($8/1000.0))`
    
    console.log(await values)
    const response = await pool.query(query, values);

    res.json({ message: 'Data inserted successfully', id: response.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error inserting data' });
  }
});



// Replace with your PostgreSQL credentials


app.post('/get', async (req, res) => {
const body = await req.body[0]
const {challan_id} = await body;
const getQuery = await pool.query(`select * from owners inner join challans on owners.plate_number = challans.plate_number where challan_id = $1;`,[challan_id])
const rows = await getQuery.rows
console.log(getQuery)
res.json({result:rows})

});

 //[{
//     "vehicle_type":"bike",
//     "bike_name":"splendor",
//     "plate_number":"tn",
//     "violations":[],
//     "fine_amount":"0",
//     "phone_no":"+919345699817",
//     "owner_name":"praveen"

// }]
app.post("/violation",async(req,res)=>{
const body = await req.body[0]; // license_plate ,violations 
console.log("violation_body",body)
const {plate_number,violations,fine_amount} = await body

    
// try{
//   const now = Date.now()
//   // const amount = await pool.query(`select fine_amount from owners where plate_number=$1`,)
//   const query = `update owners set violations=$1,updated_at=to_timestamp($2/1000.0),fine_amount = fine_amount + $3 where plate_number = $4`
// const values = [violations,now,fine_amount,plate_number]
// const response = await pool.query(query,values)
// console.log("violation_response",response)
// res.json({message:"violated updated successfully"})
// const [data] = req.body
// twilio.messages
//     .create({
//         body: `hello praveen, you violated ${data.violations} in vehicle having ${data.plate_number} we have charged you rupees ${data.fine_amount}`,
//         from: 'whatsapp:+14155238886',
//         to: 'whatsapp:+917338726600'
//     })
//     .then(message => console.log(message.sid))

// }catch(error){
//   console.error(error)
//   res.status(500).json({ message: 'Error on updating violations data' });
// }

try{

const now = Date.now()
const values = [Number(fine_amount),now,plate_number,violations];

const query = await pool.query(`insert into  challans (fine_amount,challan_created_at,plate_number,violations) values($1,to_timestamp($2/1000.0),$3,$4);`,values)
console.log("violation_response",query)
const getQuery = await pool.query('select challan_id from challans where plate_number = $1',[body.plate_number])
const {challan_id} = getQuery.rows[0]
res.json({message:"violation added successfully"})
try{


    twilio.messages.create({
        body: `hello praveen, you violated ${body.violations} in vehicle having ${body.plate_number} \n we have charged you rupees ${body.fine_amount} \n here is an challan id https://relaxed-salamander-d2266d.netlify.app/${challan_id} go to this website link to pay it `,
        from: 'whatsapp:+14155238886',
        to: 'whatsapp:+919345699817'
    })
    .then(message => console.log(message.sid))
  }catch(err){
    console.log("violation added successfully but not message sent")
    
  }
}catch(err){
  console.log("violation error".err)
  res.json({message:"error while retriveing data"})

}



})

// async function getDatawith(plateNumber){
//     try{


//     const query = `SELECT * FROM users WHERE id = $1`;
//     const values = [plateNumber];
//     const response = await pool.query(query, values);
//     return response;
//     }
//     catch(error){
//       console.error("checkplateNuber",error);
//       return error;
//     }

// }


app.listen(port, () => {
   console.log(`Server listening on port ${port}`);
});
