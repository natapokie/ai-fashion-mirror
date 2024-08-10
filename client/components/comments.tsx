export const Comments = ({ comments }: { comments: { username: string, comment: string}[] }) => {

    return (
        <>
            <div className="w-full h-32 bg-gradient-to-b from-slate-950/5 via-slate-950/70 to-slate-950">
                <div className="flex flex-col justify-start items-start p-2">
                    {comments.map((comment, index) => {
                        return (
                            // display comments that are shown from the bottom of the screen and disappear after a few seconds to the top
                            <div key={index} className="w-full h-8 bg-slate-950/70 text-white text-xs rounded-md p-1 mt-1">
                                <span className="font-bold">@{comment.username}:</span> {comment.comment}
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    )
};