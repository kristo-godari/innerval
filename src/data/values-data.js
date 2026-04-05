const VALUES_DATA = [
  {
    name: "Acceptance",
    questions: [
      { area: "Work", text: "A project you led failed despite your best efforts. Would you accept this outcome and move forward without ruminating on what could have been different?" },
      { area: "Relationships", text: "Your partner has habits that annoy you but aren't harmful (leaving dishes out, being chronically late). Would you accept these quirks as part of who they are rather than constantly trying to change them?" },
      { area: "Personal", text: "You have a personality trait that others sometimes criticize (e.g., being introverted, highly sensitive, or analytical). Would you accept this as part of who you are rather than trying to change it?" },
      { area: "Social", text: "People at a community event express political views opposite to yours. Would you listen calmly and let them hold those views without arguing?" },
      { area: "Leisure", text: "You try a new hobby and realize you're not naturally talented. Would you continue enjoying it despite being a beginner?" }
    ]
  },
  {
    name: "Accountability",
    questions: [
      { area: "Work", text: "Your team's project fails partly due to your mistake. Would you openly tell the team you were responsible for the error?" },
      { area: "Relationships", text: "You hurt a friend's feelings with a careless remark. Would you call them, admit what you said was wrong, and apologize directly?" },
      { area: "Personal", text: "You've been skipping workouts you committed to. Would you sit down and honestly assess why, rather than making excuses?" },
      { area: "Social", text: "You promised to organize a neighborhood event but fell behind. Would you announce the delay to everyone and take the blame?" },
      { area: "Leisure", text: "You borrowed a friend's expensive equipment and accidentally damaged it. Would you tell them immediately and pay for the repair?" }
    ]
  },
  {
    name: "Adventure",
    questions: [
      { area: "Work", text: "You're offered a short-term project in a foreign country you've never visited, requiring you to live there for 3 months. The pay is equivalent to your current role. Would you take it?" },
      { area: "Relationships", text: "Your partner suggests trying an adventure activity together this weekend that neither of you has done before—like rock climbing or white-water rafting. Would you enthusiastically say yes?" },
      { area: "Personal", text: "You have a free weekend: relax at home or try skydiving for the first time. Would you go skydiving?" },
      { area: "Social", text: "It's a regular Friday evening with nothing planned for the weekend. Friends call and invite you on a spontaneous road trip to an unknown destination leaving tonight. Would you pack your bag and go?" },
      { area: "Leisure", text: "You can do a vacation at your favorite familiar resort or explore a remote, uncharted village. Would you choose the unknown village?" }
    ]
  },
  {
    name: "Ambition",
    questions: [
      { area: "Work", text: "You're comfortable in your current role with manageable hours and decent pay. A new position at another company offers a steeper learning curve, higher visibility, and faster career growth—but longer hours and more pressure. Would you leave your comfortable role to pursue it?" },
      { area: "Relationships", text: "Your close friend invites you to a weekend getaway, but you've been offered a demanding side project that could significantly advance your career. The project requires your weekends for the next two months. Would you skip the trip and prioritize the career opportunity?" },
      { area: "Personal", text: "You just achieved a personal milestone. Would you immediately start planning an even bigger goal?" },
      { area: "Social", text: "You're offered the chance to lead a high-profile community initiative that would significantly raise your professional standing, but it requires 10 hours per week for a year. Would you commit to it?" },
      { area: "Leisure", text: "When picking up a new sport, would you train to compete rather than just play for fun?" }
    ]
  },
  {
    name: "Appreciation",
    questions: [
      { area: "Work", text: "A colleague quietly helped you meet a deadline. Would you publicly thank them in front of the team?" },
      { area: "Relationships", text: "Your partner handles everyday chores like cooking or cleaning. Would you make a point to regularly express gratitude for those acts?" },
      { area: "Personal", text: "After a tough period, things finally stabilize. Would you pause your routine to consciously reflect on what you're grateful for?" },
      { area: "Social", text: "A neighbor watches your house while you're away. Would you bring them a thoughtful gift rather than just saying thanks?" },
      { area: "Leisure", text: "You see a beautiful sunset on a regular evening walk. Would you stop what you're doing to truly take it in?" }
    ]
  },
  {
    name: "Authenticity",
    questions: [
      { area: "Work", text: "Your workplace culture values a polished, corporate image—formal language, suppressing emotions, always appearing confident. This feels inauthentic to who you are. Would you still show up as your genuine self—admitting uncertainty, using your natural communication style—even if it goes against the culture?" },
      { area: "Relationships", text: "On a first date, would you show your true quirks and flaws rather than presenting a polished version of yourself?" },
      { area: "Personal", text: "Social media tempts you to portray a perfect life. Would you only share posts that genuinely represent your real experience?" },
      { area: "Social", text: "At a formal event, everyone dresses and acts a certain way that feels unlike you. Would you show up in your own style anyway?" },
      { area: "Leisure", text: "Your friends love a trendy activity you find boring. Would you tell them honestly rather than go along?" }
    ]
  },
  {
    name: "Authority",
    questions: [
      { area: "Work", text: "In a group project with no assigned leader, would you step up to direct the team?" },
      { area: "Relationships", text: "When your extended family is planning a reunion, would you volunteer to coordinate and make the executive decisions about venue, dates, and activities?" },
      { area: "Personal", text: "You're organizing a personal project that involves multiple friends. Would you naturally take the role of assigning tasks and making final decisions?" },
      { area: "Social", text: "In a community committee, would you seek a leadership position rather than serve as a regular member?" },
      { area: "Leisure", text: "When playing team sports, would you volunteer to be the captain or the one calling the plays?" }
    ]
  },
  {
    name: "Beauty",
    questions: [
      { area: "Work", text: "You've finished a report or presentation ahead of the deadline with time to spare. It meets all the requirements, but looks plain. Would you spend the extra time making it visually beautiful?" },
      { area: "Relationships", text: "When setting up your home with a partner, would you invest significant time and money to make the space aesthetically beautiful?" },
      { area: "Personal", text: "Would you rearrange your daily environment to surround yourself with beautiful objects, art, or nature?" },
      { area: "Social", text: "You're helping organize a community event. Would you push for a stunning venue and decorations even if it stretches the budget?" },
      { area: "Leisure", text: "When choosing a travel destination, would you pick a place with breathtaking scenery over one with better activities or nightlife?" }
    ]
  },
  {
    name: "Certainty",
    questions: [
      { area: "Work", text: "You're offered a new role with vague responsibilities versus your current well-defined position. Would you stay in the defined role to avoid the uncertainty?" },
      { area: "Relationships", text: "Early in a relationship, would you have a direct conversation about where things are headed rather than letting it unfold naturally?" },
      { area: "Personal", text: "When making a big purchase like a car, would you research for weeks until you're certain rather than go with your gut?" },
      { area: "Social", text: "You're planning a major move to a new city. Would you need to visit multiple times, secure housing, and have a job lined up before committing, rather than moving first and figuring things out?" },
      { area: "Leisure", text: "When booking a vacation, would you plan every single day in detail rather than leave room for spontaneity?" }
    ]
  },
  {
    name: "Challenge",
    questions: [
      { area: "Work", text: "It's a normal work week with no urgent deadlines. Your manager lets you choose between a routine task you'll easily complete or a complex problem no one has solved yet. Would you pick the hard problem?" },
      { area: "Relationships", text: "A friend asks you to help with something you've never done before that seems really difficult. Would you feel excited to take it on?" },
      { area: "Personal", text: "You've been running the same 5K route comfortably for months. A friend suggests training together for a steep mountain trail race that's way beyond your current ability. Would you sign up for the harder race?" },
      { area: "Social", text: "A local group is organizing a tough obstacle course race. Would you sign up specifically because it will test your limits?" },
      { area: "Leisure", text: "When playing video games, would you always choose the hardest difficulty level?" }
    ]
  },
  {
    name: "Commitment",
    questions: [
      { area: "Work", text: "A project you've led for six months is behind schedule because of factors outside your control—vendor delays and shifting requirements. Your manager suggests shelving it to focus on new priorities. Would you push to see it through anyway?" },
      { area: "Relationships", text: "You and your partner of five years are going through a tough phase—frequent disagreements, emotional distance, and stress from life changes. There's no betrayal or abuse, just a difficult season. Would you stay and fight to work through it rather than consider walking away?" },
      { area: "Personal", text: "You started learning a musical instrument but progress is painfully slow. Would you keep practicing despite the frustration?" },
      { area: "Social", text: "You volunteered to coach a kids' team for the season, but a fun trip comes up mid-season. Would you turn down the trip to honor your coaching commitment?" },
      { area: "Leisure", text: "You signed up for a 12-week course but find it less interesting than expected. Would you complete it anyway?" }
    ]
  },
  {
    name: "Compassion",
    questions: [
      { area: "Work", text: "A colleague is underperforming because of personal problems. Would you approach them with understanding and offer support rather than report their poor performance?" },
      { area: "Relationships", text: "A family member keeps making the same mistakes. Would you respond with patience and care each time rather than with frustration?" },
      { area: "Personal", text: "You failed at something important. Would you talk to yourself gently about it rather than beating yourself up?" },
      { area: "Social", text: "A colleague is going through a divorce and breaks down crying at work. Would you sit with them, listen, and offer emotional support even if it makes you uncomfortable?" },
      { area: "Leisure", text: "While hiking, you encounter an injured stray animal far from any town. Would you go significantly out of your way to get it help?" }
    ]
  },
  {
    name: "Competence",
    questions: [
      { area: "Work", text: "Would you spend extra unpaid hours mastering your job skills to become truly excellent rather than just adequate?" },
      { area: "Relationships", text: "A friend asks you to help install a new light fixture at their house. You've never done electrical work before. Would you want to learn how to do it properly first—watching tutorials and reading instructions—before attempting it, rather than just winging it?" },
      { area: "Personal", text: "You're picking up a new hobby like woodworking or cooking. Would you invest significant time studying techniques and fundamentals to do it correctly, rather than just experimenting and learning as you go?" },
      { area: "Social", text: "You volunteer to teach a class at a community center. Would you spend days preparing to be genuinely knowledgeable rather than winging it?" },
      { area: "Leisure", text: "In a hobby like cooking or photography, would you pursue formal training and deliberate practice to develop real mastery?" }
    ]
  },
  {
    name: "Contribution",
    questions: [
      { area: "Work", text: "You're financially comfortable with no debt. A nonprofit offers you a role that directly improves people's lives, but it pays 25% less than your current corporate job. Would you take the pay cut?" },
      { area: "Relationships", text: "In your close relationships, would you regularly sacrifice your own time to actively help the other person grow and succeed?" },
      { area: "Personal", text: "When you imagine looking back on your life, would you feel empty if you hadn't contributed something lasting to the world?" },
      { area: "Social", text: "A local charity needs weekend volunteers and your schedule is already tight. Would you carve out the time anyway?" },
      { area: "Leisure", text: "Would you choose hobbies that create something for others (building, crafting, writing) over purely consumptive ones (watching, scrolling)?" }
    ]
  },
  {
    name: "Control",
    questions: [
      { area: "Work", text: "When starting a new project, would you insist on setting the timeline, process, and milestones yourself rather than having them dictated to you?" },
      { area: "Relationships", text: "Would you want to be the one who manages household finances, schedules, and major purchases rather than sharing that control equally?" },
      { area: "Personal", text: "Would you create detailed daily schedules and systems to maintain control over your time and activities?" },
      { area: "Social", text: "When organizing a group outing, would you want to handle all the planning and decision-making yourself?" },
      { area: "Leisure", text: "When playing cooperative games, would you naturally take over as the strategist directing the group's actions?" }
    ]
  },
  {
    name: "Courage",
    questions: [
      { area: "Work", text: "You notice unethical behavior at your company. Would you speak up even if it risks your position?" },
      { area: "Relationships", text: "You need to tell someone you love a painful truth that could hurt them. Would you have that conversation rather than avoid it?" },
      { area: "Personal", text: "You have 12 months of living expenses saved, no dependents, and a solid business idea you've been planning for years. Launching it means quitting your job with no guaranteed income. Would you take the leap despite the fear?" },
      { area: "Social", text: "Someone in a public setting is being bullied. Would you step in and confront the bully despite potential confrontation?" },
      { area: "Leisure", text: "You've been invited to speak at a large public event about something personally meaningful but vulnerable (like a past failure or struggle). Would you accept despite the fear of public vulnerability?" }
    ]
  },
  {
    name: "Creativity",
    questions: [
      { area: "Work", text: "You can solve a problem using a proven template or invent an entirely new approach. Would you take the creative route even if it's riskier?" },
      { area: "Relationships", text: "When planning a gift for someone, would you spend extra time creating something original rather than buying something nice?" },
      { area: "Personal", text: "Would you carve out regular time for a creative outlet (writing, art, music, design) even when life gets busy?" },
      { area: "Social", text: "You're organizing a community fundraiser. Would you push for an innovative concept rather than a tried-and-true format?" },
      { area: "Leisure", text: "Given free time, would you gravitate toward creating something (painting, coding, crafting) over consuming something (watching, reading)?" }
    ]
  },
  {
    name: "Curiosity",
    questions: [
      { area: "Work", text: "You encounter a system at work that functions well but nobody knows exactly why. Would you spend your own time digging in to understand it?" },
      { area: "Relationships", text: "You meet someone with a very unusual life story. Would you ask deep, probing questions to learn about their experiences?" },
      { area: "Personal", text: "You come across a fascinating topic unrelated to your field. Would you spend hours researching it just to satisfy your curiosity?" },
      { area: "Social", text: "At a dinner party, would you steer conversations toward deep, probing topics rather than keeping it light?" },
      { area: "Leisure", text: "When visiting a new city, would you skip the tourist spots to explore hidden corners and local secrets?" }
    ]
  },
  {
    name: "Determination",
    questions: [
      { area: "Work", text: "You've been rejected from a role you want three times. Would you apply a fourth time?" },
      { area: "Relationships", text: "You and a friend had a falling out. Rebuilding trust will take months of effort. Would you commit to that long process?" },
      { area: "Personal", text: "You're training for a marathon and hit a plateau where progress stops. Would you push through the frustration and keep training?" },
      { area: "Social", text: "You're campaigning for a local cause that keeps getting rejected by officials. Would you keep showing up and fighting for it?" },
      { area: "Leisure", text: "You're learning a very difficult piece of music. After weeks you still can't play it. Would you keep practicing until you nail it?" }
    ]
  },
  {
    name: "Discipline",
    questions: [
      { area: "Work", text: "You have a deadline in two weeks. Would you create and follow a strict daily schedule rather than work in bursts of inspiration?" },
      { area: "Relationships", text: "You and your partner set a monthly budget. A tempting purchase comes up. Would you stick to the budget anyway?" },
      { area: "Personal", text: "You committed to waking up at 5 AM daily. It's cold and dark outside. Would you get up anyway?" },
      { area: "Social", text: "Everyone at the party is drinking, and you decided to stay sober this month. Would you stick to water all night?" },
      { area: "Leisure", text: "You set a goal to read 30 minutes every evening. A binge-worthy show just dropped. Would you stick to reading?" }
    ]
  },
  {
    name: "Equality",
    questions: [
      { area: "Work", text: "Over lunch, you accidentally learn that two colleagues doing the same job are paid differently because of gender. Nobody has asked you to get involved, and speaking up could make you unpopular. Would you take the initiative to push management for equal pay?" },
      { area: "Relationships", text: "In your partnership, would you insist that household tasks, decisions, and sacrifices are split equally?" },
      { area: "Personal", text: "At a family dinner, an older relative dismisses a younger family member's opinion simply because of their age, saying they lack the experience to have a valid view. Would you speak up and insist the younger person deserves to be heard equally?" },
      { area: "Social", text: "A local policy benefits wealthy neighborhoods but neglects poorer ones. Would you attend council meetings and advocate against it?" },
      { area: "Leisure", text: "A sports league you play in has rules that unfairly disadvantage newer players. Would you argue for fairer rules?" }
    ]
  },
  {
    name: "Ethics",
    questions: [
      { area: "Work", text: "You could close a lucrative deal by exaggerating your product's capabilities. Would you stay completely honest even knowing you'll lose the sale?" },
      { area: "Relationships", text: "A friend asks you to lie to their partner on their behalf. Would you refuse, even if it damages the friendship?" },
      { area: "Personal", text: "You're doing your taxes and realize you could claim a deduction you don't technically qualify for. It would save you $1,500 and the chance of being audited is extremely low. Would you report your taxes accurately anyway?" },
      { area: "Social", text: "A shopkeeper undercharges you significantly by mistake. Would you point out the error and pay the full amount?" },
      { area: "Leisure", text: "In a competitive game, you notice a way to cheat without anyone catching you. Would you play fair anyway?" }
    ]
  },
  {
    name: "Excellence",
    questions: [
      { area: "Work", text: "It's Friday afternoon and you've finished a task that meets all the requirements. You could leave on time, or stay an extra two hours to polish it into something truly outstanding. You have no evening plans. Would you stay to make it excellent?" },
      { area: "Relationships", text: "You're hosting dinner for friends. Would you spend hours perfecting the food, setup, and ambiance rather than keeping it casual?" },
      { area: "Personal", text: "In a personal project no one else will ever see, would you still work to make it excellent?" },
      { area: "Social", text: "You're organizing a community event. Would you obsess over every detail to ensure the highest quality?" },
      { area: "Leisure", text: "When writing a personal email or letter, would you carefully craft every sentence rather than dash it off?" }
    ]
  },
  {
    name: "Excitement",
    questions: [
      { area: "Work", text: "Your current job offers a lateral move to a more dynamic role with frequent surprises, changing priorities, and high energy—but same pay and hours. Would you switch?" },
      { area: "Relationships", text: "In a long-term relationship, would you regularly plan surprises and new experiences to keep things thrilling?" },
      { area: "Personal", text: "Would you actively seek out experiences that give you an adrenaline rush—even if they carry some risk?" },
      { area: "Social", text: "Your friends are planning the weekend: one group wants to check out a new live music festival downtown, the other wants a relaxed dinner at someone's home. Would you pick the festival?" },
      { area: "Leisure", text: "Would you try bungee jumping, racing, or extreme sports before choosing a spa day?" }
    ]
  },
  {
    name: "Fame",
    questions: [
      { area: "Work", text: "Would you change your career strategy to increase the chance your achievements become widely recognized in your industry?" },
      { area: "Relationships", text: "Would it matter to you that your partner sees you as someone admired and recognized by others?" },
      { area: "Personal", text: "If you achieved something significant, would it matter to you whether the recognition stayed within a small expert community versus reaching a large public audience?" },
      { area: "Social", text: "At a party, would you feel disappointed if nobody recognized you or sought you out to talk?" },
      { area: "Leisure", text: "In a hobby, would you work to gain a following or public recognition rather than just enjoy it privately?" }
    ]
  },
  {
    name: "Family",
    questions: [
      { area: "Work", text: "You have young children at home and your family is already financially comfortable. A major promotion would mean 60+ hour weeks—missing most weekday dinners and some weekends. Would you turn it down to protect family time?" },
      { area: "Relationships", text: "Would you make it a point to call or visit extended family regularly, even when your schedule is packed?" },
      { area: "Personal", text: "When deciding where to live or whether to change careers, would the impact on your family outweigh other factors?" },
      { area: "Social", text: "A friend's big event conflicts with a family gathering. Would you choose the family event?" },
      { area: "Leisure", text: "Would you spend most weekends and holidays doing activities with family rather than solo or with friends?" }
    ]
  },
  {
    name: "Financial stability",
    questions: [
      { area: "Work", text: "You have three months of savings and a partner who earns a modest income. You must choose between a passion project with uncertain income for the first year, or a less exciting corporate job with a guaranteed salary and benefits. Would you take the stable paycheck?" },
      { area: "Relationships", text: "Would you insist that you and your partner jointly build savings and maintain a solid financial safety net?" },
      { area: "Personal", text: "Would you make it a strict rule to always have at least 6 months of expenses saved?" },
      { area: "Social", text: "Friends invite you on a $3,000 week-long trip that would wipe out a quarter of your emergency fund. You can technically afford it, but it sets back your savings goals by several months. Would you decline to protect your finances?" },
      { area: "Leisure", text: "A hobby you love costs about $400 a month—a real stretch for your budget. Continuing means cutting into your savings and other spending. Would you give it up to stay within budget?" }
    ]
  },
  {
    name: "Forgiveness",
    questions: [
      { area: "Work", text: "A colleague took credit for your idea in a meeting. Would you forgive them and move on rather than hold a grudge?" },
      { area: "Relationships", text: "Your partner of several years shared something deeply private about you with others, and it got back to you. They're genuinely remorseful and want to make things right. Would you forgive them and work to rebuild the trust?" },
      { area: "Personal", text: "You made a terrible decision that cost you a lot. Would you forgive yourself and move on rather than dwell in self-blame?" },
      { area: "Social", text: "A neighbor caused damage to your property and apologized sincerely. Would you let it go without demanding extra compensation?" },
      { area: "Leisure", text: "In a rec league, a player fouls you hard then apologizes. Would you genuinely forgive them and keep playing without resentment?" }
    ]
  },
  {
    name: "Freedom",
    questions: [
      { area: "Work", text: "Your job pays well and is stable, but requires strict 9-to-5 office attendance with no remote work and rigid processes. You have a standing offer for a similar role at a smaller company with full flexibility, but 15% less pay. Would you leave for the flexible role?" },
      { area: "Relationships", text: "In a relationship, would you push back if your partner expected you to give up your independent hobbies and interests?" },
      { area: "Personal", text: "Would you avoid taking on long-term obligations (mortgage, long contracts) to keep the freedom to change course in life?" },
      { area: "Social", text: "Everyone at a formal work dinner orders expensive wine and follows a strict dress code you find unnecessary. Would you order what you actually want and dress in your own style, even if you stand out?" },
      { area: "Leisure", text: "Would you leave a full weekend completely unscheduled so you can do whatever you feel like in the moment?" }
    ]
  },
  {
    name: "Friendship",
    questions: [
      { area: "Work", text: "Would you regularly invite colleagues for after-work activities to build genuine friendships beyond professional relationships?" },
      { area: "Relationships", text: "When life gets busy, would you still carve out time to maintain your closest friendships?" },
      { area: "Personal", text: "When going through a difficult time, would you reach out and confide in friends rather than handle it alone?" },
      { area: "Social", text: "Would you regularly put yourself in new social situations to expand your circle and make new friends?" },
      { area: "Leisure", text: "You have limited free time this month. Would you prioritize maintaining regular hangouts with friends over making progress on a personal goal that excites you?" }
    ]
  },
  {
    name: "Growth",
    questions: [
      { area: "Work", text: "You've been in a comfortable, well-paying role for three years but your skills are plateauing. A new company offers a role with cutting-edge projects and strong mentorship, but pays 20% less. You have enough savings to handle the pay cut. Would you make the switch?" },
      { area: "Relationships", text: "A new friend gives you honest, sometimes blunt feedback about your habits and pushes you to set higher standards for yourself. It's uncomfortable at times, but you notice you're improving. Would you deepen that friendship over one that's easier but less growth-oriented?" },
      { area: "Personal", text: "Would you regularly invest time and money in courses, books, or experiences specifically aimed at personal growth?" },
      { area: "Social", text: "Would you join communities focused on self-improvement even if you don't know anyone there?" },
      { area: "Leisure", text: "When choosing a hobby, would you pick one that develops new skills over one that's purely relaxing?" }
    ]
  },
  {
    name: "Health",
    questions: [
      { area: "Work", text: "You have the option to work from home on days you're feeling physically run down, but your team prefers everyone in-office for collaboration. Would you prioritize your health and work from home when needed?" },
      { area: "Relationships", text: "Would you actively encourage your family to adopt healthier eating and exercise habits, even if they resist?" },
      { area: "Personal", text: "Would you maintain a disciplined routine of exercise, nutrition, and sleep even when you don't feel like it?" },
      { area: "Social", text: "Friends want to go out for heavy drinking and junk food. Would you order something healthy and skip the drinks?" },
      { area: "Leisure", text: "On a lazy Saturday, would you choose a hike or gym session over binge-watching a show?" }
    ]
  },
  {
    name: "Helpfulness",
    questions: [
      { area: "Work", text: "A new hire is struggling and it's not your job to train them. Would you spend your own time helping them get up to speed?" },
      { area: "Relationships", text: "You're spending a quiet Saturday afternoon catching up on a show you've been looking forward to. A friend texts asking if you can help them move a couch to their new apartment today. Would you pause your plans and go help?" },
      { area: "Personal", text: "You've had a long day at work and finally sat down to relax for the evening. A neighbor knocks on your door asking for help carrying heavy furniture up the stairs. Would you get up and help them?" },
      { area: "Social", text: "You see a stranger struggling with heavy bags in a parking lot. Would you walk over and offer to help?" },
      { area: "Leisure", text: "You're skilled at a hobby and a beginner asks for detailed guidance. Would you spend hours of your free time teaching them?" }
    ]
  },
  {
    name: "Honesty",
    questions: [
      { area: "Work", text: "A client asks your honest opinion about a product flaw. Being truthful would lose the sale. Would you tell them the truth anyway?" },
      { area: "Relationships", text: "A close friend asks for your honest feedback on their business idea. You think it has serious flaws. Would you share your genuine concerns rather than being encouraging and vague?" },
      { area: "Personal", text: "Would you sit down and honestly confront your own weaknesses rather than avoiding uncomfortable self-reflection?" },
      { area: "Social", text: "Everyone in a group discussion agrees on something you think is wrong. Would you speak up with your dissenting view?" },
      { area: "Leisure", text: "In a party game where bluffing is optional, would you play honestly even if bluffing would help you win?" }
    ]
  },
  {
    name: "Independence",
    questions: [
      { area: "Work", text: "Would you prefer working without supervision, even if it means getting less guidance and support?" },
      { area: "Relationships", text: "Would you insist on keeping some finances, hobbies, or personal space completely separate from your partner?" },
      { area: "Personal", text: "When facing a difficult problem, would you work through it alone before asking anyone for help?" },
      { area: "Social", text: "Would you comfortably go to restaurants, movies, or concerts alone without feeling like you need company?" },
      { area: "Leisure", text: "Would you maintain solo hobbies that are entirely your own, separate from anyone else's involvement?" }
    ]
  },
  {
    name: "Influence",
    questions: [
      { area: "Work", text: "Would you actively seek influence over your team's direction and major decisions, not just focus on your own tasks?" },
      { area: "Relationships", text: "Would you push for your opinions to shape the decisions your friend group or family makes?" },
      { area: "Personal", text: "Would you intentionally try to live in ways that influence and inspire people around you?" },
      { area: "Social", text: "Would you seek out roles like board member, advisor, or mentor to influence outcomes in your community?" },
      { area: "Leisure", text: "In group activities, would you feel frustrated if your suggestions were consistently ignored?" }
    ]
  },
  {
    name: "Inner harmony",
    questions: [
      { area: "Work", text: "When work gets chaotic and stressful, would you pause to find inner calm rather than powering through the frenzy?" },
      { area: "Relationships", text: "After a heated argument with a loved one, would you prioritize restoring your inner peace before dealing with anything else?" },
      { area: "Personal", text: "Would you maintain a daily practice like meditation, journaling, or reflection to keep your inner balance?" },
      { area: "Social", text: "When surrounded by drama or gossip, would you deliberately withdraw to protect your inner peace?" },
      { area: "Leisure", text: "On a free evening, would you choose an activity focused on inner reflection—like meditation, journaling, or a long solo walk—over joining friends for drinks and conversation?" }
    ]
  },
  {
    name: "Intelligence",
    questions: [
      { area: "Work", text: "Would you turn down a higher-paying role if the work was intellectually boring and purely procedural?" },
      { area: "Relationships", text: "When choosing close friends or a partner, would you prioritize the ability to have deep intellectual conversations?" },
      { area: "Personal", text: "You're browsing a bookstore and see two books that interest you: a challenging non-fiction book on a complex topic that would stretch your thinking, and an entertaining novel you'd breeze through. Would you pick the challenging one?" },
      { area: "Social", text: "At a social gathering, would you steer conversations toward ideas and concepts rather than keeping things casual?" },
      { area: "Leisure", text: "Would you pick a strategy game, a complex puzzle, or a deep book over watching a movie or scrolling social media?" }
    ]
  },
  {
    name: "Job security",
    questions: [
      { area: "Work", text: "You've been at your company five years with a steady paycheck and clear path upward. A fast-growing but two-year-old company offers you an exciting role with more responsibility, though its long-term future is uncertain. Would you turn it down to keep your secure position?" },
      { area: "Relationships", text: "You have a stable income that covers your basic needs. Your partner wants to leave their steady job to pursue freelance work with unpredictable income. Would their job instability bother you even though you're financially covered?" },
      { area: "Personal", text: "When evaluating a job offer, would the stability and low likelihood of layoffs be your top priority, even over pay, growth, or interest level?" },
      { area: "Social", text: "When friends talk about quitting to start a business, would you advise them to keep the secure job?" },
      { area: "Leisure", text: "Would you turn down a dream job opportunity if it came from a company with uncertain long-term prospects, even if current compensation was excellent?" }
    ]
  },
  {
    name: "Justice",
    questions: [
      { area: "Work", text: "A coworker is unfairly blamed for something they didn't do. Would you speak up and set the record straight, even against a manager?" },
      { area: "Relationships", text: "In a family dispute involving you, would you argue for a resolution that's fair to all sides, even if you end up with less?" },
      { area: "Personal", text: "When you read about an unjust situation in the news, would you take concrete action like writing, donating, or protesting?" },
      { area: "Social", text: "A local business is treating workers unfairly. Would you boycott them and publicly urge others to do the same?" },
      { area: "Leisure", text: "In a game with friends, a disputed call arises. Would you insist on the fair ruling even if it costs your team the game?" }
    ]
  },
  {
    name: "Love",
    questions: [
      { area: "Work", text: "You earn a high salary in a career you've invested years in, but you feel no genuine love or excitement for the work. You have enough savings to sustain yourself for a year while pivoting. Would you leave?" },
      { area: "Relationships", text: "Your partner is going through a period of depression—they're withdrawn, irritable, and unable to contribute equally to the relationship. It's been months with slow progress. Would you stay fully emotionally present and supportive rather than pulling away?" },
      { area: "Personal", text: "You have a free evening. Would you spend it having a deep, vulnerable conversation with someone you care about rather than pursuing a hobby or personal project?" },
      { area: "Social", text: "Would you openly express warmth and affection to people in your broader community, not just close friends?" },
      { area: "Leisure", text: "Would you choose spending free time with the people you love over pursuing a solo passion project?" }
    ]
  },
  {
    name: "Loyalty",
    questions: [
      { area: "Work", text: "Your company is going through a financial rough patch—there have been layoffs, but your position is secure. You like your team and your manager. A competitor offers you 30% more pay for a similar role. Would you stay out of loyalty?" },
      { area: "Relationships", text: "A friend is being criticized behind their back at a gathering. Would you stand up and defend them publicly?" },
      { area: "Personal", text: "A close friend who's always been there for you starts going through a rough patch—they're unreliable, cancel plans often, and aren't much fun to be around lately. Other friends have started distancing themselves. Would you stick by them and keep showing up?" },
      { area: "Social", text: "Your local sports team has been losing for years. Would you remain a loyal supporter rather than switching to a winning team?" },
      { area: "Leisure", text: "You've been going to the same barber for years. A trendier, better-reviewed option opens nearby. Would you stick with your original?" }
    ]
  },
  {
    name: "Meaningful work",
    questions: [
      { area: "Work", text: "Your company restructures your role. Your new responsibilities are well-paid but feel pointless—filing reports nobody reads, attending meetings with no real outcomes. The salary is the same. Would the lack of meaning make you seriously consider leaving?" },
      { area: "Relationships", text: "Would you expect your partner to fully support your need for meaningful work, even at a financial cost?" },
      { area: "Personal", text: "When your daily tasks don't connect to a larger purpose, do you feel a deep sense of discomfort or emptiness?" },
      { area: "Social", text: "Would you volunteer significant time for projects that create meaningful social impact, even with no financial reward?" },
      { area: "Leisure", text: "Would you choose volunteering or purpose-driven hobbies over purely recreational activities on your days off?" }
    ]
  },
  {
    name: "Passion",
    questions: [
      { area: "Work", text: "You're single with a year's worth of living expenses saved. Quitting your stable job to pursue work you're truly passionate about would mean no salary for at least six months while you build it up. Would you quit to follow the passion?" },
      { area: "Relationships", text: "Would you prioritize emotional intensity and romantic passion in a relationship over comfortable, predictable stability?" },
      { area: "Personal", text: "Would you feel something essential was missing from your life if you had nothing you felt truly passionate about?" },
      { area: "Social", text: "Would you gravitate toward people who are visibly passionate about something, even if their interests are completely different from yours?" },
      { area: "Leisure", text: "When you discover a hobby you're passionate about, would you reorganize your schedule and budget to pour more time into it?" }
    ]
  },
  {
    name: "Peace",
    questions: [
      { area: "Work", text: "Your current workplace pays well but involves constant office politics, heated meetings, and interpersonal conflict that drains you daily. A similar role at a smaller, calm company pays 15% less. Would you take the pay cut for a peaceful work environment?" },
      { area: "Relationships", text: "You live in a bustling, exciting urban neighborhood with nightlife and constant activity. A quieter, more peaceful neighborhood would add 15 minutes to your commute. Would you move for the peace?" },
      { area: "Personal", text: "Would you remove yourself from situations—parties, groups, conversations—that disrupt your sense of inner peace?" },
      { area: "Social", text: "When a social gathering turns into a heated argument, would you step in and try to calm everyone down?" },
      { area: "Leisure", text: "After a hectic week, you have a free Saturday with no obligations. Would you spend it in a calm, slow-paced way—like walking in nature or sitting quietly with a coffee—rather than filling it with activities and socializing?" }
    ]
  },
  {
    name: "Pleasure",
    questions: [
      { area: "Work", text: "You genuinely enjoy your current role and its daily work. A promotion offers 30% more pay but shifts you into management meetings and administrative tasks you'd find tedious. Would you turn it down to keep doing work you enjoy?" },
      { area: "Relationships", text: "Would you regularly plan indulgent experiences—fancy dinners, trips, entertainment—to share with loved ones?" },
      { area: "Personal", text: "Would you treat yourself to things that bring pure enjoyment—spa days, fine food, entertainment—without feeling guilty?" },
      { area: "Social", text: "When choosing between a fun social outing and an educational workshop, would you always pick the fun option?" },
      { area: "Leisure", text: "Would you spend your free time on pure indulgences—fine dining, luxury relaxation, entertainment—rather than productive projects?" }
    ]
  },
  {
    name: "Popularity",
    questions: [
      { area: "Work", text: "Would you actively work to be well-liked by everyone on your team—remembering personal details, adjusting your communication style, being agreeable—even when it requires significant effort?" },
      { area: "Relationships", text: "Would it bother you if your partner or friend group wasn't socially popular or well-connected?" },
      { area: "Personal", text: "When making personal choices about your appearance or lifestyle, would you consider how others will perceive you?" },
      { area: "Social", text: "At a party, would you work the room to make sure everyone knows you and likes you?" },
      { area: "Leisure", text: "Would you choose a trending activity or hot restaurant because everyone's going there, even if a niche option interests you more?" }
    ]
  },
  {
    name: "Privacy",
    questions: [
      { area: "Work", text: "Colleagues at lunch are sharing stories about their weekends, families, and personal lives. Would you keep your contributions vague and surface-level rather than sharing real details about your own life?" },
      { area: "Relationships", text: "Would you insist your partner never look at your phone, journal, or personal belongings without permission?" },
      { area: "Personal", text: "Would it make you uncomfortable if acquaintances found out details about your finances, health, or personal struggles?" },
      { area: "Social", text: "Would you carefully filter what you share on social media, keeping most of your real life private?" },
      { area: "Leisure", text: "Would you regularly carve out private time where nobody—partner, friends, family—can reach you?" }
    ]
  },
  {
    name: "Religion",
    questions: [
      { area: "Work", text: "Would you turn down a job that conflicts with your religious beliefs, even if it was a great career move?" },
      { area: "Relationships", text: "Would you only consider a serious relationship with someone who shares your religious faith?" },
      { area: "Personal", text: "Would you maintain daily religious practices—prayer, worship, scripture study—even on your busiest days?" },
      { area: "Social", text: "Would you make attending religious community gatherings and traditions a weekly priority?" },
      { area: "Leisure", text: "Would you avoid entertainment or leisure activities that conflict with your religious values?" }
    ]
  },
  {
    name: "Reputation",
    questions: [
      { area: "Work", text: "Would you invest significant effort in building a standout professional reputation, beyond just doing good work?" },
      { area: "Relationships", text: "Would it bother you if your extended family or in-laws had a poor opinion of you?" },
      { area: "Personal", text: "Before making a controversial decision, would you seriously weigh how it affects how others perceive you?" },
      { area: "Social", text: "Would you go out of your way to be seen as an upstanding, reliable member of your community?" },
      { area: "Leisure", text: "In hobby communities, would you work to become known and well-regarded by other enthusiasts?" }
    ]
  },
  {
    name: "Respect",
    questions: [
      { area: "Work", text: "When someone at work dismisses your input or talks over you in meetings, would you address it directly to re-establish mutual respect?" },
      { area: "Relationships", text: "Would you end a relationship if your partner repeatedly dismissed your opinions or ignored your boundaries?" },
      { area: "Personal", text: "When someone you care about treats you disrespectfully, does it hurt you deeply—more than other types of conflict?" },
      { area: "Social", text: "You're at a community meeting and someone with a low-status job—a janitor or a cleaner—raises a point that others dismiss or talk over. Would you stop the conversation and insist their input be heard?" },
      { area: "Leisure", text: "In a recreational sports league, a new player joins who isn't very skilled. Would you treat them with the same respect and consideration as the best players?" }
    ]
  },
  {
    name: "Security",
    questions: [
      { area: "Work", text: "You're comparing two offers: a Fortune 500 company with predictable income and solid benefits, and a well-funded three-year-old startup offering 25% more pay but with less certainty about its future. You have moderate savings. Would you choose the large, stable company?" },
      { area: "Relationships", text: "Would emotional safety—knowing your partner won't leave or betray you—be the most essential quality in a relationship?" },
      { area: "Personal", text: "Would you spend significant time and money on insurance, emergency funds, and backup plans for worst-case scenarios?" },
      { area: "Social", text: "Would you pay more to live in a safe neighborhood with low crime rather than a more interesting area?" },
      { area: "Leisure", text: "When traveling, would you avoid adventurous destinations and stick to places with strong safety records?" }
    ]
  },
  {
    name: "Spirituality",
    questions: [
      { area: "Work", text: "You have a successful career with good pay and recognition, but the work leaves you feeling spiritually hollow and disconnected from what matters to you. You're financially stable enough to take time to explore a new path. Would you leave?" },
      { area: "Relationships", text: "Would you prioritize finding a partner who can connect with you on a deep spiritual level?" },
      { area: "Personal", text: "Would you maintain daily spiritual practices—meditation, mindfulness, contemplation—even when life gets hectic?" },
      { area: "Social", text: "Would you seek out communities that explore meaning, consciousness, or transcendence?" },
      { area: "Leisure", text: "Would you spend a vacation on a spiritual retreat rather than a conventional holiday?" }
    ]
  },
  {
    name: "Success",
    questions: [
      { area: "Work", text: "Reaching the next level of professional success—a VP title, industry recognition, prestigious awards—would require 55+ hour weeks for the next two years, cutting into your evenings and weekends. Your life is comfortable now. Would you make that trade-off?" },
      { area: "Relationships", text: "Would it matter to you that others see your relationships as successful and enviable?" },
      { area: "Personal", text: "After reaching a goal, would you feel restless until you've set and pursued the next one?" },
      { area: "Social", text: "Would you feel disappointed if your community didn't see you as a successful person?" },
      { area: "Leisure", text: "Even in hobbies, would you track your progress and push to win, complete, or master things rather than just enjoy the activity?" }
    ]
  },
  {
    name: "Teamwork",
    questions: [
      { area: "Work", text: "Would you choose a collaborative team project over working independently, even if solo work would be faster?" },
      { area: "Relationships", text: "Would you and your partner make all major decisions—finances, chores, parenting—as a team rather than dividing responsibilities separately?" },
      { area: "Personal", text: "Does working with others energize you more than working alone?" },
      { area: "Social", text: "Would you seek out clubs, organizations, or group activities where people work together toward shared goals?" },
      { area: "Leisure", text: "A friend invites you to join a recreational soccer league. You also enjoy running on your own. Would you choose the team sport over solo running?" }
    ]
  },
  {
    name: "Tolerance",
    questions: [
      { area: "Work", text: "A new coworker practices a religion you're unfamiliar with, which involves prayer breaks during the day and different holiday observances. Would you support their practices and learn about them with genuine openness?" },
      { area: "Relationships", text: "A close family member holds beliefs you strongly disagree with. Would you maintain the relationship without trying to change their mind?" },
      { area: "Personal", text: "When someone's lifestyle choices confuse or bother you, would you keep your judgment to yourself and let them live their way?" },
      { area: "Social", text: "Your neighborhood is becoming very diverse with many new cultures. Would you welcome the change and embrace the differences?" },
      { area: "Leisure", text: "At a gathering, someone shares opinions you find offensive. Would you respond calmly rather than confronting them?" }
    ]
  },
  {
    name: "Tradition",
    questions: [
      { area: "Work", text: "Your company decides to eliminate long-standing rituals to modernize. Would you fight to preserve them?" },
      { area: "Relationships", text: "Would you insist on keeping family traditions—holiday routines, recipes, annual gatherings—even when others want to change them?" },
      { area: "Personal", text: "Would you spend significant effort to learn and pass on cultural or family traditions to the next generation?" },
      { area: "Social", text: "Your community wants to replace a traditional annual festival with a modern event. Would you campaign to keep the tradition?" },
      { area: "Leisure", text: "Would you celebrate holidays in their customary, traditional way rather than reinventing them?" }
    ]
  },
  {
    name: "Trust",
    questions: [
      { area: "Work", text: "Would you give a colleague full autonomy on a critical task without checking their work, because you trust them?" },
      { area: "Relationships", text: "If trust broke in a close relationship, would you find it nearly impossible to continue?" },
      { area: "Personal", text: "Would you guard a friend's sensitive secret, never sharing it with anyone, even your partner?" },
      { area: "Social", text: "A friend asks to borrow something valuable of yours (car, expensive equipment) for a weekend. Based on your history together, would you lend it without hesitation?" },
      { area: "Leisure", text: "In a team game, would you trust your teammates to do their part without checking on them?" }
    ]
  },
  {
    name: "Uniqueness",
    questions: [
      { area: "Work", text: "Would you deliberately develop an approach that sets you apart from everyone else on your team?" },
      { area: "Relationships", text: "Your friends and family expect you to follow the usual relationship milestones—move in after a year, get engaged, have a traditional wedding. You and your partner want to do things differently, like traveling long-term instead of settling down. Would you follow your own unconventional path despite the raised eyebrows?" },
      { area: "Personal", text: "Would you make lifestyle choices that express your individuality, even if they seem odd to others?" },
      { area: "Social", text: "At a gathering, would you rather stand out as different than blend in with the crowd?" },
      { area: "Leisure", text: "Would you seek out unusual, niche hobbies rather than popular mainstream ones?" }
    ]
  },
  {
    name: "Variety",
    questions: [
      { area: "Work", text: "Would you feel restless and bored if your job involved doing the same tasks every day?" },
      { area: "Relationships", text: "Would you actively seek out friends from different backgrounds, cultures, and interests rather than sticking to similar people?" },
      { area: "Personal", text: "When stuck in the same routine for a few weeks, would you feel an urge to shake things up?" },
      { area: "Social", text: "Would you rotate through different types of social events—sports, arts, outdoors, dining—rather than always doing the same thing?" },
      { area: "Leisure", text: "Would you try a brand-new restaurant or activity this weekend rather than returning to your favorite?" }
    ]
  },
  {
    name: "Wealth",
    questions: [
      { area: "Work", text: "Two career paths are open to you: one in finance that could earn $200K within five years but doesn't excite you, and one in a field you find fascinating that tops out around $100K. Would you choose the finance path primarily for the higher income?" },
      { area: "Relationships", text: "Would financial wealth factor heavily into your assessment of your own or a partner's success?" },
      { area: "Personal", text: "Would you aggressively invest and save to build significant wealth, beyond what's needed for security?" },
      { area: "Social", text: "Would you work toward having the wealth to afford a lifestyle others would envy?" },
      { area: "Leisure", text: "Would you choose first-class flights, premium seats, and luxury products over budget options, even if the experience is similar?" }
    ]
  },
  {
    name: "Wisdom",
    questions: [
      { area: "Work", text: "Before making a major professional decision, would you take significant time to reflect and consider long-term consequences rather than acting quickly?" },
      { area: "Relationships", text: "Would you want to be the person that friends and family seek out for thoughtful advice on difficult decisions?" },
      { area: "Personal", text: "Would you spend regular time on reflection, deep reading, and studying life experience to cultivate deeper understanding?" },
      { area: "Social", text: "In a community discussion, would you hold back until you can offer a thoughtful, well-considered perspective rather than voicing a quick opinion?" },
      { area: "Leisure", text: "Would you choose reading philosophy, studying history, or having deep discussions over light entertainment on a free evening?" }
    ]
  }
];
