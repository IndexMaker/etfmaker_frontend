import { Card, CardContent } from "@/components/ui/card"
import Chri_Lin from "../../../public/images/chris-lin.png"
import Chri_Lin_Bio from "../../../public/images/Chris Lin biotech.jpg"
import Image from 'next/image'
export default function PortfolioManagerInsights() {
  const insights = [
    {
      id: 1,
      image: <Image className="w-full h-[100px] object-cover" src={Chri_Lin_Bio} alt={""} />,
      title: "Breakthrough biotechs with a bright future",
      description:
        "Fidelity's Chris Lin considers two biotech companies well-positioned to revolutionize drug development and the treatment of major diseases.",
      isLink: true,
    },
    {
      id: 2,
      image: <Image width={135} className="w-[135px] h-[135px] object-cover" src={Chri_Lin} alt={""} />,
      title: "AI-Revolutionary",
      description:
        "Fidelity U.S. large cap growth portfolio managers see artificial intelligence as the most compelling multiyear investment theme that is going to drive major disruption across a variety of businesses.",
      isLink: true,
    },
    {
      id: 2,
      image: <Image width={135} className="w-[145px] h-[135px] object-cover" src={Chri_Lin} alt={""} />,
      title: "U.S. Large Cap Growth: Innovation in Growth",
      description:
        "Fidelity U.S. large cap growth portfolio managers identify the major investment themes they expect to drive accelerating revenue and earnings growth over the next several years.",
      isLink: true,
    },
  ]

  return (
    <Card className="w-full min-w-[350px] h-[430px] border-none bg-foreground overflow-auto p-2 gap-2 flex-1">
      <div className="pb-1  border-b-1 border-gray-200">
        <h2 className="text-[16px] px-3 font-semibold">Portfolio Manager Insights</h2>
      </div>
      <CardContent className="space-y-6 overflow-y-auto px-3">
        {insights.map((insight, index) => (
          <div key={index} className="space-y-3">
            <div className="w-full">
                {
                    insight.image ? insight.image : 
                    <img
                      src={insight.image || "/placeholder.svg"}
                      alt={insight.title}
                      className="w-full h-[120px] object-cover rounded-md"
                    />
                }
            </div>
            <div className="space-y-2">
              <h3
                className={`text-[14px] font-medium ${insight.isLink ? "text-[#2470ff] hover:underline cursor-pointer" : ""}`}
              >
                {insight.title}
              </h3>
              <p className="text-[13px] leading-relaxed text-secondary">{insight.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
