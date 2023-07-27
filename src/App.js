import React, { useState, useEffect } from "react";
import './App.css';
import Header from "./components/header/Header";
import PostItem from "./components/post-item/PostItem";
import {
    auth,
    db,
    storage,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    serverTimestamp,
    ref,
    uploadBytesResumable,
    getDownloadURL
} from './firebaseConfig';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import Modal from "@mui/material/Modal";
import { Button, Input } from "@mui/material";
import Box from "@mui/material/Box";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

function App() {
    const [posts, setPosts] = useState([]);
    const [openModal, setOpenModal] = useState(false); // Check open modal
    const [openSignInModal, setOpenSignInModal] = useState(false)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [user, setUser] = useState(null);

    //State
    const [openModalUpload, setOpenModalUpload] = useState(false);
    const [image, setImage] = useState(null);
    const [progress, setProgress] = useState(0);
    const [caption, setCaption] = useState("");

    const handleClickAddNewPost = (childData) => {
        setOpenModalUpload(childData);
    };

    //useEffect -> Runs a piece of code based on a specific condition.
    useEffect(() => {
        // this is where the code runs
        getData();
    }, []);

    useEffect(() => {
        const unSubcribe = auth.onAuthStateChanged((authUser) => {
            if(authUser) {
                // user has logged in...
                setUser(authUser);
                setUsername(authUser.displayName);
            } else {
                // user has logged out...
                setUser(null);
            }
        });
        return () => {
            // Perform some cleanup actions
            unSubcribe();
        }
    }, [user, username])

    const getData = async () => {
        const postsCol = collection(db, "posts");
        const snapshot = await getDocs(postsCol);
        setPosts(
            snapshot.docs.map((doc) => ({
                id: doc.id,
                post: doc.data(),
            }))
        );
    };

    const handleClickSignUp = (childData) => {
        setOpenModal(childData);
    }

    const handleClickSignIn = (childData) => {
        setOpenSignInModal(childData);
    }

    const handleSignUp = (event) => {
        event.preventDefault();
        createUserWithEmailAndPassword(auth, email, password).then((authUser) => {
            return updateProfile(authUser.user, {
                displayName: username
            });
        }).catch((error) => alert(error.message));
        setOpenModal(false);
    }

    const handleSignIn = (event) => {
        event.preventDefault();
        signInWithEmailAndPassword(auth, email, password).then(authUser => {
            return setUsername(authUser.user.displayName);
        }).catch((error) =>
            alert(error.message)
        );
        setOpenSignInModal(false);
    }

    const handleClickLogOut = (childData) => {
        if(childData === true) {
            auth.signOut();
        }
    }

    const handleChangeFile = (e) => {
        setImage(e.target.files[0])
    }

    const handleUpload = () => {
        const storageRef = ref(storage, `images/${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                //progress function
                const progress = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                setProgress(progress);
            },
            (error) => {
                //handle Error
                alert(error.message);
            },
            () => {
                //handle when complete
                getDownloadURL(uploadTask.snapshot.ref).then(
                    async url => {
                        //Save link image in db of firebase
                        const newPost = doc(collection(db, 'posts'))
                        await setDoc(newPost,
                            {
                                timestamp: serverTimestamp(),
                                caption: caption,
                                imageUrl: url,
                                userName: username
                            }
                        );
                        setProgress(0);
                        setCaption('');
                        setImage(null);
                    }
                );
            }
        );
    };

    return (
        <div className="App">
            {/* Header */}
            <Header takeMessAddNewPost={handleClickAddNewPost} takeMessSignUp={handleClickSignUp} takeMessLogOut={handleClickLogOut} takeMessLogIn={handleClickSignIn} user={user}/>
            {/* Posts */}
            <div className="Post__list">
                {posts.map(({ id, post }) => (
                    <PostItem key={id} data={post} />
                ))}
            </div>
            {/* Modal sign up */}
            <Modal open={openModal} onClose={() => setOpenModal(false)} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box sx={style}>
                    <div>
                        <form className="form__signup">
                            <img className="form__logo"
                                 src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                                 alt="Logo"
                            />
                            <div className="form__group">
                                <label>User name:</label>
                                <Input className="form__field" placeholder="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                            </div>
                            <div className="form__group">
                                <label>Email:</label>
                                <Input className="form__field" placeholder="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="form__group">
                                <label>Password:</label>
                                <Input className="form__field" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <Button className="btn-signup" onClick={handleSignUp}>Sign up</Button>
                        </form>
                    </div>
                </Box>
            </Modal>
            {/* Modal sign in */}
            <Modal open={openSignInModal} onClose={() => setOpenSignInModal(false)} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <div style={style}>
                    <form className="form__signup">
                        <img className="form__logo"
                             src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                             alt="Logo"
                        />
                        <div className="form__group">
                            <label>Email:</label>
                            <Input className="form__field" placeholder="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="form__group">
                            <label>Password:</label>
                            <Input className="form__field" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <Button className="btn-signup" onClick={handleSignIn}>Sign In</Button>
                    </form>
                </div>
            </Modal>
            <Modal open={openModalUpload} onClose={() => setOpenModalUpload(false)}>
                <Box sx={style}>
                    <div>
                        <form className="form__signup">
                            <img className="form__logo"
                                 src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                                 alt="Logo"
                            />
                            <div className="form__group">
                                <progress value={progress} max="100" />
                            </div>
                            <div className="form__group">
                                <Input
                                    className="form__field"
                                    placeholder="Enter a caption"
                                    type="text"
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                />
                            </div>
                            <div className="form__group">
                                <input
                                    className="form__field"
                                    type="file"
                                    onChange={handleChangeFile}
                                />
                            </div>
                            <Button className="btn-signup" onClick={handleUpload}>
                                Upload
                            </Button>
                        </form>
                    </div>
                </Box>
            </Modal>
        </div>
    );
}

export default App;
