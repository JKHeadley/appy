import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const features = [
  {
    title: <>Easy to Use</>,
    imageUrl: 'img/undraw_docusaurus_mountain.svg',
    description: (
      <>
        Docusaurus was designed from the ground up to be easily installed and
        used to get your website up and running quickly.
      </>
    ),
  },
  {
    title: <>Focus on What Matters</>,
    imageUrl: 'img/undraw_docusaurus_tree.svg',
    description: (
      <>
        Docusaurus lets you focus on your docs, and we&apos;ll do the chores. Go
        ahead and move your docs into the <code>docs</code> directory.
      </>
    ),
  },
  {
    title: <>Powered by React</>,
    imageUrl: 'img/undraw_docusaurus_react.svg',
    description: (
      <>
        Extend or customize your website layout by reusing React. Docusaurus can
        be extended while reusing the same header and footer.
      </>
    ),
  },
];

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={classnames('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

// function Home() {
//   const context = useDocusaurusContext();
//   const {siteConfig = {}} = context;
//   return (
//     <Layout
//       title={`Hello from ${siteConfig.title}`}
//       description="Description will go into a meta tag in <head />">
//       <header className={classnames('hero hero--primary', styles.heroBanner)}>
//         <div className="container">
//           <h1 className="hero__title">{siteConfig.title}</h1>
//           <p className="hero__subtitle">{siteConfig.tagline}</p>
//           <div className={styles.buttons}>
//             <Link
//               className={classnames(
//                 'button button--outline button--secondary button--lg',
//                 styles.getStarted,
//               )}
//               to={useBaseUrl('docs/doc1')}>
//               Get Started
//             </Link>
//           </div>
//         </div>
//       </header>
//       <main>
//         {features && features.length && (
//           <section className={styles.features}>
//             <div className="container">
//               <div className="row">
//                 {features.map((props, idx) => (
//                   <Feature key={idx} {...props} />
//                 ))}
//               </div>
//             </div>
//           </section>
//         )}
//       </main>
//     </Layout>
//   );
// }


function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <div className="landing">
        <head>
          <title>appy landing page</title>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          <link rel="shortcut icon" type="image/x-icon" href="img/favicon.ico" />

          <link rel="apple-touch-icon" sizes="180x180" href="img/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="img/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="img/favicon-16x16.png" />
          <link rel="manifest" href="img/site.webmanifest" />
          <link rel="mask-icon" href="img/safari-pinned-tab.svg" color="#5bbad5"></link>

          {/* <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400"></link> */}
        </head>
        <body>

          <div id="wrapper">

            <header id="header" className="alt">
              <span className="logo"><img src="/img/logo.svg" alt="" /></span>
              <h1 className="slogan">The most complete boilerplate app on the web.</h1>
              <a href="#live_demo" className="button big icon fa-chrome">LIVE DEMO</a>
              <a href="https://github.com/JKHeadley/appy" target="_blank" className="button big icon fa-cloud-download" style={{ "marginLeft": "4px" }}>DOWNLOAD</a>

              <h1>
                <a className="github-button" href="https://github.com/JKHeadley/appy" data-size="large" aria-label="Star JKHeadley/appy on GitHub">Star</a>
              </h1>

              <p style={{ "fontSize": "0.9em" }}>Like the project? Give it a <span className="fa fa-star"></span>!</p>

              <p>An open source web app targeted for mvp development. The goal of appy
              is to provide you with some of the most common features and functionality found in modern
              web apps. Use it as a launching point to build out your own app, or simply as a learning
							tool to understand how technologies integrate. Now you can test out your ideas faster than ever!</p>
            </header>

            <nav id="nav">
              <ul>
                <li><a href="#features" className="active">Features</a></li>
                <li><a href="#front_end">Front End</a></li>
                <li><a href="#back_end">Back End</a></li>
                <li><a href="#live_demo">Live Demo</a></li>
              </ul>
            </nav>

            <div id="main">

              <section id="features" className="main special">
                <header className="major">
                  <h2>Features</h2>
                </header>
                <ul className="features">
                  <li>
                    <span className="icon major style5 fa-rocket"></span>
                    <h3>Complete App</h3>
                    <p>Fully-functional frontend and backend.</p>
                  </li>
                  <li>
                    <span className="icon major style3 fa-eye"></span>
                    <h3>Engaging UI</h3>
                    <p>Aesthetic UI components based on the popular <a href="https://adminlte.io/" target="_blank"><span className="label">AdminLTE</span></a> template.</p>
                  </li>
                  <li>
                    <span className="icon major style2 fa-key"></span>
                    <h3>Robust Auth</h3>
                    <p>Login flows and Authorization utilizing roles, groups, and permissions.</p>
                  </li>
                  <li>
                    <span className="icon major style4 fa-ellipsis-h"></span>
                    <h3>Swagger</h3>
                    <p>Easy endpoint documentation and testing through <a href="https://api.appyapp.io/" target="_blank"><span className="label">Swagger UI</span></a>.</p>
                  </li>
                  <li>
                    <span className="icon major style1 fa-comments-o"></span>
                    <h3>Websockets</h3>
                    <p>Real-time features such as notifications and chat.</p>
                  </li>
                  <li>
                    <span className="icon major style5 fa-handshake-o"></span>
                    <h3>Social Network</h3>
                    <p>Connect with and follow other users.</p>
                  </li>
                  <li>
                    <span className="icon major style3 fa-file-image-o"></span>
                    <h3>User Content</h3>
                    <p>Shareable docs and image uploads.
									</p>
                  </li>
                  <li>
                    <span className="icon major style2 fa-lock"></span>
                    <h3>Admin Controls</h3>
                    <p>Disable users, update permissions, and query audit logs.</p>
                  </li>
                  <li>
                    <span className="icon major style4 fa-diamond"></span>
                    <h3>Powerful Tech</h3>
                    <p>Vue frontend, hapi backend, MongoDB datastore.</p>
                  </li>
                </ul>
                <footer className="major">
                  <ul className="actions">
                    <li><a href="https://github.com/JKHeadley/appy" target="_blank" className="button">Learn More</a></li>
                  </ul>
                </footer>
              </section>

              <section id="front_end" className="main">
                <div className="spotlight">
                  <div className="content">
                    <header className="major">
                      <h2>
                        <div>
                          <span>Front End</span>
                        </div>
                      </h2>
                    </header>
                    <span className="screenshot center">
                      <img src="https://user-images.githubusercontent.com/12631935/39155220-f691c77e-4705-11e8-9b83-2129a07c6d35.png" alt="" />
                    </span>
                    <p>Built with modern tech and design principles, the front end is fully responsive
                    and provides tools such as hot-reloading and reusable components allowing you to
										adapt appy to your mvp needs.</p>
                    <ul className="actions">
                      <li><a href="https://github.com/JKHeadley/appy" className="button">Learn More</a></li>
                    </ul>
                  </div>
                  <span className="screenshot right">
                    <img src="https://user-images.githubusercontent.com/12631935/39155220-f691c77e-4705-11e8-9b83-2129a07c6d35.png" alt="" />
                  </span>
                </div>
              </section>

              <section id="back_end" className="main">
                <div className="spotlight">
                  <span className="screenshot left"><img src="img/appy-api-screenshot.png" alt="" /></span>
                  <div className="content">
                    <header className="major">
                      <h2>Back End</h2>
                    </header>
                    <span className="screenshot center"><img src="img/appy-api-screenshot.png" alt="" /></span>
                    <p>The robust backend features auto-generated endpoints based on data models allowing
                    for rapid API development. Built in swagger plugins make API testing and documentation
									a piece of cake.</p>
                    <ul className="actions">
                      <li><a href="https://github.com/JKHeadley/appy" className="button">Learn More</a></li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="live_demo" className="main special">
                <header className="major">
                  <h2>Live Demo</h2>
                  <ul className="statistics" id="live_demo_stats">
                    <li className="style1">
                      <span className="icon fa-mouse-pointer"></span>
                      <strong></strong> Visitors
									</li>
                    <li className="style2">
                      <span className="icon fa-user-plus"></span>
                      <strong></strong> Users Registered
									</li>
                    <li className="style3">
                      <span className="icon fa-comments"></span>
                      <strong></strong> Messages Sent
									</li>
                    <li className="style4">
                      <span className="icon fa-image"></span>
                      <strong></strong> Images Uploaded
									</li>
                    <li className="style5">
                      <span className="icon fa-file"></span>
                      <strong></strong> Docs Created
									</li>
                  </ul>
                  <p>Test appy for yourself! <a href="https://demo.appyapp.io/register" target="_blank"><span className="label">Create an account</span></a>
									, <a href="https://demo.appyapp.io/login" target="_blank"><span className="label">login with a social network</span></a>
									, or try one of the demo accounts below.</p>
                </header>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Account</th>
                        <th>Description</th>
                        <th>Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>User</td>
                        <td>They're everywhere! Users have access to all the standard features.</td>
                        <td><a href="https://demo.appyapp.io/login?email=test@user.com&password=root"
                          target="_blank" className="button special icon fa-sign-in">Try It!</a></td>
                      </tr>
                      <tr>
                        <td>Admin</td>
                        <td>Taking care of business. Admins can manage user permissions and view audit
											logs.</td>
                        <td><a href="https://demo.appyapp.io/login?email=test@admin.com&password=root"
                          target="_blank" className="button special icon fa-sign-in">Try It!</a></td>
                      </tr>
                      <tr>
                        <td>Super Admin</td>
                        <td>The big boss! A super admin has access to all views and actions.</td>
                        <td><a href="https://demo.appyapp.io/login?email=test@superadmin.com&password=root"
                          target="_blank" className="button special icon fa-sign-in">Try It!</a></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>You can also view the live swagger docs <a href="https://api.appyapp.io/" target="_blank"><span className="label">here</span></a>.</p>
                <footer className="major">
                  <ul className="actions">
                    <li><a href="https://github.com/JKHeadley/appy" target="_blank" className="button">Learn More</a></li>
                  </ul>
                </footer>
              </section>

            </div>

            <footer id="footer" className="align-center">
              <ul className="icons">
                <li><a href="#" className="icon fa-twitter alt"><span className="label">Twitter</span></a></li>
                <li><a href="#" className="icon fa-facebook alt"><span className="label">Facebook</span></a></li>
                <li><a href="#" className="icon fa-github alt"><span className="label">GitHub</span></a></li>
              </ul>
              <p className="copyright">&copy; appy 2017-2018. Design: <a href="https://html5up.net">HTML5 UP</a>.</p>
            </footer>

          </div>

          {/* <script src="/js/jquery.min.js"></script>
          <script src="/js/jquery.scrollex.min.js"></script>
          <script src="/js/jquery.scrolly.min.js"></script>
          <script src="/js/skel.min.js"></script>
          <script src="/js/util.js"></script>
          <script src="/js/main.js"></script>

          <script async defer src="https://buttons.github.io/buttons.js"></script> */}

        </body>
      </div>
    </Layout>
  );
}

export default Home;
