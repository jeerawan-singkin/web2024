const RB=ReactBootstrap;
const {Alert, Card, Button, Table} = ReactBootstrap;
// ใช้ config จาก เว็บ Firebase: Project Setting 
const firebaseConfig = {
    apiKey: "AIzaSyBeipr4oFWmiWAaw3wIpRcnAU0FtGOimJM",
    authDomain: "web2567-a268d.firebaseapp.com",
    projectId: "web2567-a268d",
    storageBucket: "web2567-a268d.firebasestorage.app",
    messagingSenderId: "14801710463",
    appId: "1:14801710463:web:c47751036f39e159b9fe4a",
    measurementId: "G-MYE712BX7D"
  };

  firebase.initializeApp(firebaseConfig);      
  const db = firebase.firestore();
  
  function StudentTable({ data, app }) {
      return (
          <table className="table">
              <thead>
                  <tr>
                      <th>รหัส</th>
                      <th>คำนำหน้า</th>
                      <th>ชื่อ</th>
                      <th>สกุล</th>
                      <th>email</th>
                      <th>แก้ไข</th>
                      <th>ลบ</th>
                  </tr>
              </thead>
              <tbody>
                  {data.map((s) => (
                      <tr key={s.id}>
                          <td>{s.id}</td>
                          <td>{s.title}</td>
                          <td>{s.fname}</td>
                          <td>{s.lname}</td>
                          <td>{s.email}</td>
                          <td><EditButton std={s} app={app} /></td>
                          <td><DeleteButton std={s} app={app} /></td>
                      </tr>
                  ))}
              </tbody>
          </table>
      );
  }
  
  function EditButton({ std, app }) {
      return <button className="btn btn-warning" onClick={() => app.edit(std)}>แก้ไข</button>;
  }
  
  function DeleteButton({ std, app }) {    
      return <button className="btn btn-danger" onClick={() => app.delete(std)}>ลบ</button>;
  }
  
  function TextInput({ label, app, value, style }) {
      return (
          <div className="mb-3">
              <label className="form-label">{label}:</label>
              <input
                  className="form-control"
                  style={style}
                  value={app.state[value]}
                  onChange={(ev) => {
                      const s = {};
                      s[value] = ev.target.value;
                      app.setState(s);
                  }}
              />
          </div>
      );
  }
  
  // LoginBox Component for showing login/logout buttons
  function LoginBox(props) {
    const u = props.user;
    const app = props.app;
    if (!u) {
        return <div><Button onClick={() => app.google_login()}>Login</Button></div>
    } else {
        return <div>
            <img src={u.photoURL} />
            {u.email}<Button onClick={() => app.google_logout()}>Logout</Button></div>
    }
}

  
  class App extends React.Component {
      state = {
          scene: 0,
          user: null,
          students: [],
          stdid: "",
          stdtitle: "",
          stdfname: "",
          stdlname: "",
          stdemail: "",
          stdphone: "",
      };
  
      title = (
          <Alert variant="info">
              <b>Work6 :</b> Firebase
          </Alert>
      );
      footer = (
          <div>
              By xxxxxxxxxx-x xxxxxxxxxxxxx xxxxxxxxxxxxxx <br />
              College of Computing, Khon Kaen University
          </div>
      );
  
      // Firebase Authentication State Listener
      constructor() {
          super();
          firebase.auth().onAuthStateChanged((user) => {
              if (user) {
                  this.setState({ user: user.toJSON() });
              } else {
                  this.setState({ user: null });
              }
          });
      }
  
      // Google Login
      google_login() {
          var provider = new firebase.auth.GoogleAuthProvider();
          provider.addScope("profile");
          provider.addScope("email");
          firebase.auth().signInWithPopup(provider);
      }
  
      // Google Logout
      google_logout() {
          if (confirm("Are you sure?")) {
              firebase.auth().signOut();
          }
      }
  
      // Fetch data from Firebase
      readData() {
          db.collection("students").get().then((querySnapshot) => {
              const stdlist = [];
              querySnapshot.forEach((doc) => {
                  stdlist.push({ id: doc.id, ...doc.data() });
              });
              console.log(stdlist);
              this.setState({ students: stdlist });
          });
      }
  
      // Real-time data reading from Firebase
      autoRead() {
          db.collection("students").onSnapshot((querySnapshot) => {
              const stdlist = [];
              querySnapshot.forEach((doc) => {
                  stdlist.push({ id: doc.id, ...doc.data() });
              });
              console.log(stdlist);
              this.setState({ students: stdlist });
          });
      }
  
      // Insert student data to Firebase
      insertData() {
          db.collection("students").doc(this.state.stdid).set({
              title: this.state.stdtitle,
              fname: this.state.stdfname,
              lname: this.state.stdlname,
              phone: this.state.stdphone,
              email: this.state.stdemail,
          });
      }
  
      // Edit student data
      edit(std) {
          this.setState({
              stdid: std.id,
              stdtitle: std.title,
              stdfname: std.fname,
              stdlname: std.lname,
              stdemail: std.email,
              stdphone: std.phone,
          });
      }
  
      // Delete student data
      delete(std) {
          if (confirm("ต้องการลบข้อมูล")) {
              db.collection("students").doc(std.id).delete();
          }
      }
  
      render() {
          return (
              <Card>
                  <Card.Header>{this.title}</Card.Header>
                  <LoginBox user={this.state.user} app={this} />
                  <Card.Body>
                      {this.state.user && (
                          <>
                              <Button onClick={() => this.readData()}>Read Data</Button>
                              <Button onClick={() => this.autoRead()}>Auto Read</Button>
                              <StudentTable data={this.state.students} app={this} />
                          </>
                      )}
                  </Card.Body>
                  <Card.Footer>
                      <b>เพิ่ม/แก้ไขข้อมูล นักศึกษา :</b><br />
                      <TextInput label="ID" app={this} value="stdid" style={{ width: 120 }} />
                      <TextInput label="คำนำหน้า" app={this} value="stdtitle" style={{ width: 100 }} />
                      <TextInput label="ชื่อ" app={this} value="stdfname" style={{ width: 120 }} />
                      <TextInput label="สกุล" app={this} value="stdlname" style={{ width: 120 }} />
                      <TextInput label="Email" app={this} value="stdemail" style={{ width: 150 }} />
                      <TextInput label="Phone" app={this} value="stdphone" style={{ width: 120 }} />
                      <Button onClick={() => this.insertData()}>Save</Button>
                  </Card.Footer>
                  <Card.Footer>{this.footer}</Card.Footer>
              </Card>
          );
      }
  }
  
  // Rendering the component
  const container = document.getElementById("myapp");
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
