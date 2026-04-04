import React from 'react';

export default function SkeletonPost() {
  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16" style={{ height: '400px' }}>
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eee' }}></div>
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <div className="skeleton" style={{ width: '120px', height: '16px', background: '#eee', marginBottom: '8px' }}></div>
              <div className="skeleton" style={{ width: '80px', height: '12px', background: '#eee' }}></div>
            </div>
          </div>
        </div>
        <div className="skeleton" style={{ width: '100%', height: '20px', background: '#eee', marginTop: '16px' }}></div>
        <div className="skeleton" style={{ width: '70%', height: '20px', background: '#eee', marginTop: '8px' }}></div>
        <div className="skeleton" style={{ width: '100%', height: '200px', background: '#eee', marginTop: '16px', borderRadius: '8px' }}></div>
      </div>
      
      <style jsx>{`
        .skeleton {
          animation: skeleton-loading 1s linear infinite alternate;
        }

        @keyframes skeleton-loading {
          0% {
            background-color: hsl(200, 20%, 80%);
          }
          100% {
            background-color: hsl(200, 20%, 95%);
          }
        }
      `}</style>
    </div>
  );
}
