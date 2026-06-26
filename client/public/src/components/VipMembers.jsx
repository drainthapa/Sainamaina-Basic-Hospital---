import { fileUrl } from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function VipMembers({ members }) {
  const { field } = useLanguage();

  return (
    <div className="team-card-holder">
      <div className="row">
        <div className="vip-member-section">
          {members.map((member) => (
            <div className="col-md-12 col-xs-12" key={member.id}>
              <div className="vip-member-box">
                <div className="vip-img">
                  <img
                    className="team-img"
                    src={fileUrl(member.photo_url) || '/assets/images/admin/dummy-image-one.jpg'}
                    alt={member.full_name}
                  />
                </div>
                <div className="vip-info">
                  <h2 className="name">{member.full_name}</h2>
                  <h4 className="post-contact">{field(member, 'designation')}</h4>
                  {member.phone && <h4 className="post-contact">{member.phone}</h4>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
