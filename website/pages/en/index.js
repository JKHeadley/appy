/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

// require(process.cwd() + '/pages/assets/css/main.css')

const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

// const LandingContainer = require(process.cwd() + '/pages/landing-page.js')


class HomeSplash extends React.Component {
  render() {
    const { siteConfig, language = '' } = this.props;
    const { baseUrl, docsUrl } = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`;

    const SplashContainer = props => (
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

          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400"></link>
        </head>
        <body>

          <div id="wrapper">

            <header id="header" className="alt">
              <span className="logo"><img src="img/logo.svg" alt="" /></span>
              <h1 className="slogan">The most complete boilerplate app on the web.</h1>
              <a href="#live_demo" className="button big icon fa-chrome">LIVE DEMO</a>
              <a href="https://github.com/JKHeadley/appy" target="_blank" className="button big icon fa-cloud-download" style={{ "marginLeft": "4px" }}>DOWNLOAD</a>

              <h1>
                <a className="github-button" href="https://github.com/JKHeadley/appy" data-size="large" aria-label="Star JKHeadley/appy on GitHub">Star</a>
              </h1>

              <p style={{ "fontSize": "0.9em" }}>Like the project? Give it a <span className="icon fa-star"></span>!</p>

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
                  <ul className="statistics">
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
              <p className="copyright">Design: <a href="https://html5up.net">HTML5 UP</a>.</p>
            </footer>

          </div>

          <script src="js/jquery.min.js"></script>
          <script src="js/jquery.scrollex.min.js"></script>
          <script src="js/jquery.scrolly.min.js"></script>
          <script src="js/skel.min.js"></script>
          <script src="js/util.js"></script>
          <script src="js/main.js"></script>

        </body>




      </div>
    );

    const Logo = props => (
      <div className="projectLogo">
        <img src={props.img_src} alt="Project Logo" />
      </div>
    );

    const ProjectTitle = props => (
      <h2 className="projectTitle">
        {props.title}
        <small>{props.tagline}</small>
      </h2>
    );

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    );

    const Button = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    );

    return (
      <SplashContainer>
      </SplashContainer>
      // LandingContainer
    );
  }
}

class Index extends React.Component {
  render() {
    const { config: siteConfig, language = '' } = this.props;
    const { baseUrl } = siteConfig;

    const Block = props => (
      <Container
        padding={['bottom', 'top']}
        id={props.id}
        background={props.background}>
        <GridBlock
          align="center"
          contents={props.children}
          layout={props.layout}
        />
      </Container>
    );

    const FeatureCallout = () => (
      <div
        className="productShowcaseSection paddingBottom"
        style={{ textAlign: 'center' }}>
        <h2>Feature Callout</h2>
        <MarkdownBlock>These are features of this project</MarkdownBlock>
      </div>
    );

    const TryOut = () => (
      <Block id="try">
        {[
          {
            content:
              'To make your landing page more attractive, use illustrations! Check out ' +
              '[**unDraw**](https://undraw.co/) which provides you with customizable illustrations which are free to use. ' +
              'The illustrations you see on this page are from unDraw.',
            image: `${baseUrl}img/undraw_code_review.svg`,
            imageAlign: 'left',
            title: 'Wonderful SVG Illustrations',
          },
        ]}
      </Block>
    );

    const Description = () => (
      <Block background="dark">
        {[
          {
            content:
              'This is another description of how this project is useful',
            image: `${baseUrl}img/undraw_note_list.svg`,
            imageAlign: 'right',
            title: 'Description',
          },
        ]}
      </Block>
    );

    const LearnHow = () => (
      <Block background="light">
        {[
          {
            content:
              'Each new Docusaurus project has **randomly-generated** theme colors.',
            image: `${baseUrl}img/undraw_youtube_tutorial.svg`,
            imageAlign: 'right',
            title: 'Randomly Generated Theme Colors',
          },
        ]}
      </Block>
    );

    const Features = () => (
      <Block layout="fourColumn">
        {[
          {
            content: 'This is the content of my feature',
            image: `${baseUrl}img/undraw_react.svg`,
            imageAlign: 'top',
            title: 'Feature One',
          },
          {
            content: 'The content of my second feature',
            image: `${baseUrl}img/undraw_operating_system.svg`,
            imageAlign: 'top',
            title: 'Feature Two',
          },
        ]}
      </Block>
    );

    const Showcase = () => {
      if ((siteConfig.users || []).length === 0) {
        return null;
      }

      const showcase = siteConfig.users
        .filter(user => user.pinned)
        .map(user => (
          <a href={user.infoLink} key={user.infoLink}>
            <img src={user.image} alt={user.caption} title={user.caption} />
          </a>
        ));

      const pageUrl = page => baseUrl + (language ? `${language}/` : '') + page;

      return (
        <div className="productShowcaseSection paddingBottom">
          <h2>Who is Using This?</h2>
          <p>This project is used by all these people</p>
          <div className="logos">{showcase}</div>
          <div className="more-users">
            <a className="button" href={pageUrl('users.html')}>
              More {siteConfig.title} Users
            </a>
          </div>
        </div>
      );
    };

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
      </div>
    );
  }
}

module.exports = Index;
