import React from "react"

const PostSkeleton = () => (
  <div className="post">
    <div className="post-sidebar">
      <button className="upvote-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-up"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg></button>
      <p></p>
      <button className="downvote-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-down"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg></button>
    </div>
    <div className="post-main">
      <div className="post-header">
        <p>
        </p>
      </div>
      <div className="post-title">
        {/* <ContentLoader
          speed={2}
          width={404}
          height={10}
          viewBox="0 0 404 10"
          backgroundColor="#f6f5f4"
          foregroundColor="#deddda"
          {...props}
          style={{ marginBottom: 5 }}
        >
          <rect x="150" y="154" rx="0" ry="0" width="1" height="1" />
          <rect x="0" y="0" rx="0" ry="0" width="240" height="24" />
        </ContentLoader> */}
      </div>
      <div className="post-body">
        {/* <ContentLoader
          speed={2}
          width={404}
          height={22}
          viewBox="0 0 404 22"
          backgroundColor="#f6f5f4"
          foregroundColor="#deddda"
          {...props}
          style={{ marginTop: 10 }}
        >
          <rect x="150" y="154" rx="0" ry="0" width="1" height="1" />
          <rect x="0" y="0" rx="0" ry="0" width="309" height="5" />
          <rect x="-4" y="9" rx="0" ry="0" width="261" height="5" />
          <rect x="-16" y="18" rx="0" ry="0" width="236" height="5" />
        </ContentLoader> */}
      </div>
    </div>
  </div>
)

export default PostSkeleton

